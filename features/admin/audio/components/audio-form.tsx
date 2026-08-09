"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect, useRef } from "react";
import { Wand2, Save, Video, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/admin/form-field";
import { ImagePreview } from "@/features/admin/components/image-preview";
import { slugify } from "@/utils/slugify";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/utils/media";
import { audioFormSchema, type AudioFormInput } from "@/features/admin/audio/validation";
import { createAudio, updateAudio, fetchYouTubeMetadata } from "@/features/admin/audio/actions";

export interface AudioSeriesOption {
  id: string;
  judul: string;
}

interface AudioFormProps {
  defaultValues?: Partial<AudioFormInput>;
  audioId?: string;
  seriesOptions: AudioSeriesOption[];
}

export function AudioForm({ defaultValues, audioId, seriesOptions }: AudioFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugAuto, setSlugAuto] = useState(true);
  const [published, setPublished] = useState(defaultValues?.published ?? false);
  const [youtubeUrl, setYoutubeUrl] = useState(defaultValues?.youtubeUrl ?? "");
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaStatus, setMetaStatus] = useState<string | null>(null);
  const metaFilledForRef = useRef<string | null>(null);

  const videoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AudioFormInput>({
    resolver: zodResolver(audioFormSchema),
    defaultValues: {
      judul: "",
      slug: "",
      seriesId: "",
      nomorSesi: 1,
      deskripsi: "",
      durasi: 0,
      cover: "",
      published: false,
      youtubeUrl: "",
      ...defaultValues,
    },
  });

  // Auto-fill judul, durasi, dan cover saat URL YouTube valid (debounced).
  // Hanya mengisi field yang masih kosong dan hanya sekali per URL.
  useEffect(() => {
    if (!videoId || metaFilledForRef.current === youtubeUrl) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setMetaLoading(true);
      setMetaStatus(null);
      try {
        const result = await fetchYouTubeMetadata(youtubeUrl);
        if (cancelled) return;
        if (result.ok) {
          const { title, durationSeconds, thumbnail } = result.data;
          let filled = false;
          if (title && getValues("judul") === "") {
            setValue("judul", title);
            if (getValues("slug") === "") setValue("slug", slugify(title));
            filled = true;
          }
          if (durationSeconds && durationSeconds > 0 && getValues("durasi") === 0) {
            setValue("durasi", durationSeconds, { shouldValidate: true });
            filled = true;
          }
          if (thumbnail && getValues("cover") === "") {
            setValue("cover", thumbnail);
            filled = true;
          }
          if (filled) {
            metaFilledForRef.current = youtubeUrl;
            setMetaStatus("Judul, durasi, dan cover terisi otomatis dari video.");
          }
        } else {
          setMetaStatus(result.error.message);
        }
      } catch {
        if (!cancelled) setMetaStatus("Gagal mengambil metadata video.");
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [videoId, youtubeUrl, getValues, setValue]);

  const onSubmit = (values: AudioFormInput) => {
    const payload = { ...values, published, youtubeUrl };
    startTransition(async () => {
      const result = audioId ? await updateAudio(audioId, payload) : await createAudio(payload);
      if (result.ok) {
        router.push("/admin/audio");
        router.refresh();
      } else {
        setFormError(result.error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-5">
      {formError && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {formError}
        </div>
      )}

      <FormField label="Judul Audio" required error={errors.judul?.message}>
        <Input
          {...register("judul")}
          placeholder="Judul audio / sesi"
          invalid={!!errors.judul}
          onChange={(e) => {
            void register("judul").onChange(e);
            if (slugAuto) setValue("slug", slugify(e.target.value));
          }}
        />
      </FormField>

      <FormField label="Slug" hint="Kosongkan untuk membuat otomatis dari judul" error={errors.slug?.message}>
        <div className="flex gap-2">
          <Input
            {...register("slug")}
            placeholder="judul-audio"
            invalid={!!errors.slug}
            onChange={(e) => {
              setSlugAuto(false);
              void register("slug").onChange(e);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSlugAuto(true);
              setValue("slug", slugify(getValues("judul")), { shouldValidate: true });
            }}
            disabled={!getValues("judul")}
          >
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </FormField>

      <FormField label="Series" required error={errors.seriesId?.message}>
        <Select {...register("seriesId")} invalid={!!errors.seriesId}>
          <option value="">Pilih series...</option>
          {seriesOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.judul}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nomor Sesi" required error={errors.nomorSesi?.message}>
          <Input
            type="number"
            min={1}
            {...register("nomorSesi", { valueAsNumber: true })}
            invalid={!!errors.nomorSesi}
          />
        </FormField>
        <FormField label="Durasi (detik)" required error={errors.durasi?.message}>
          <Input
            type="number"
            min={0}
            {...register("durasi", { valueAsNumber: true })}
            placeholder="mis. 3600"
            invalid={!!errors.durasi}
          />
        </FormField>
      </div>

      <FormField label="Deskripsi" error={errors.deskripsi?.message}>
        <Textarea {...register("deskripsi")} rows={4} placeholder="Deskripsi audio..." invalid={!!errors.deskripsi} />
      </FormField>

      <FormField label="Cover" hint="Tempel URL gambar eksternal (mis. thumbnail YouTube)" error={errors.cover?.message}>
        <div className="flex flex-col gap-3">
          <Input {...register("cover")} placeholder="https://..." invalid={!!errors.cover} />
          <ImagePreview value={getValues("cover")} onChange={(url) => setValue("cover", url, { shouldValidate: true })} />
        </div>
      </FormField>

      <FormField label="Status">
        <Select value={published ? "true" : "false"} onChange={(e) => setPublished(e.target.value === "true")}>
          <option value="false">Draft</option>
          <option value="true">Published</option>
        </Select>
      </FormField>

      <FormField
        label="Media Source — YouTube URL"
        hint="Tempel URL YouTube. Video ID dan embed URL dibuat otomatis. Judul, durasi, dan cover juga terisi otomatis bila field masih kosong."
        error={youtubeUrl && !videoId ? "URL YouTube tidak valid" : undefined}
      >
        <div className="flex flex-col gap-3">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=xxxx atau https://youtu.be/xxxx"
            invalid={youtubeUrl.length > 0 && !videoId}
          />
          {metaLoading && (
            <p className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Mengambil metadata video...
            </p>
          )}
          {metaStatus && !metaLoading && (
            <p
              className={`flex items-center gap-2 text-xs ${
                metaStatus.startsWith("Judul") ? "text-success" : "text-danger"
              }`}
            >
              {metaStatus.startsWith("Judul") ? (
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Wand2 className="h-3.5 w-3.5" aria-hidden />
              )}
              {metaStatus}
            </p>
          )}
          {videoId && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <Image
                src={getYouTubeThumbnail(videoId, "mqdefault")}
                alt="Preview video"
                width={96}
                height={56}
                className="h-14 w-24 rounded-md object-cover"
              />
              <div className="min-w-0 text-xs">
                <p className="flex items-center gap-1 font-medium text-foreground">
                  <Video className="h-3.5 w-3.5 text-red-500" />
                  Video ID: <span className="font-mono text-brand">{videoId}</span>
                </p>
                <p className="mt-0.5 truncate text-muted">
                  Embed: https://www.youtube.com/embed/{videoId}
                </p>
              </div>
            </div>
          )}
        </div>
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/audio")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
