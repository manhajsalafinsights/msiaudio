"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Wand2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/admin/form-field";
import { CheckboxGroup } from "@/features/admin/components/checkbox-group";
import { ImagePreview } from "@/features/admin/components/image-preview";
import { slugify } from "@/utils/slugify";
import { seriesFormSchema, type SeriesFormInput } from "@/features/admin/series/validation";
import { createSeries, updateSeries } from "@/features/admin/series/actions";

export interface SeriesOption {
  id: string;
  nama: string;
}

interface SeriesFormProps {
  defaultValues?: Partial<SeriesFormInput>;
  seriesId?: string;
  kitabOptions: SeriesOption[];
  speakerOptions: SeriesOption[];
  categoryOptions: SeriesOption[];
  tagOptions: SeriesOption[];
  audioCount?: number;
}

export function SeriesForm({
  defaultValues,
  seriesId,
  kitabOptions,
  speakerOptions,
  categoryOptions,
  tagOptions,
  audioCount = 0,
}: SeriesFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugAuto, setSlugAuto] = useState(true);
  const [speakerIds, setSpeakerIds] = useState<string[]>(defaultValues?.speakerIds ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(defaultValues?.categoryIds ?? []);
  const [tagIds, setTagIds] = useState<string[]>(defaultValues?.tagIds ?? []);
  const [published, setPublished] = useState(defaultValues?.published ?? false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SeriesFormInput>({
    resolver: zodResolver(seriesFormSchema),
    defaultValues: {
      judul: "",
      slug: "",
      cover: "",
      deskripsi: "",
      seriesTypeId: "",
      published: false,
      speakerIds: [],
      categoryIds: [],
      tagIds: [],
      ...defaultValues,
    },
  });

  const onSubmit = (values: SeriesFormInput) => {
    const payload = { ...values, speakerIds, categoryIds, tagIds, published };
    startTransition(async () => {
      const result = seriesId ? await updateSeries(seriesId, payload) : await createSeries(payload);
      if (result.ok) {
        router.push("/admin/series");
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

      <FormField label="Judul Series" required error={errors.judul?.message}>
        <Input
          {...register("judul")}
          placeholder="Judul series"
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
            placeholder="judul-series"
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

      <FormField label="Kitab / Jenis Kajian" required error={errors.seriesTypeId?.message}>
        <Select {...register("seriesTypeId")} invalid={!!errors.seriesTypeId}>
          <option value="">Pilih kitab...</option>
          {kitabOptions.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Cover" hint="Tempel URL gambar eksternal (mis. thumbnail YouTube)" error={errors.cover?.message}>
        <div className="flex flex-col gap-3">
          <Input {...register("cover")} placeholder="https://..." invalid={!!errors.cover} />
          <ImagePreview value={getValues("cover")} onChange={(url) => setValue("cover", url, { shouldValidate: true })} />
        </div>
      </FormField>

      <FormField label="Deskripsi" error={errors.deskripsi?.message}>
        <Textarea {...register("deskripsi")} rows={5} placeholder="Deskripsi series..." invalid={!!errors.deskripsi} />
      </FormField>

      <FormField label="Status" hint={`Jumlah sesi saat ini: ${audioCount}`}>
        <Select
          value={published ? "true" : "false"}
          onChange={(e) => setPublished(e.target.value === "true")}
        >
          <option value="false">Draft</option>
          <option value="true">Published</option>
        </Select>
      </FormField>

      <CheckboxGroup
        label="Ustadz"
        options={speakerOptions.map((o) => ({ id: o.id, label: o.nama }))}
        selected={speakerIds}
        onChange={setSpeakerIds}
      />

      <CheckboxGroup
        label="Kategori"
        options={categoryOptions.map((o) => ({ id: o.id, label: o.nama }))}
        selected={categoryIds}
        onChange={setCategoryIds}
      />

      <CheckboxGroup
        label="Tag"
        options={tagOptions.map((o) => ({ id: o.id, label: o.nama }))}
        selected={tagIds}
        onChange={setTagIds}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/series")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
