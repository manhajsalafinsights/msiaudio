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
import { ImagePreview } from "@/features/admin/components/image-preview";
import { slugify } from "@/utils/slugify";
import { ustadzFormSchema, type UstadzFormInput } from "@/features/admin/ustadz/validation";
import { createUstadz, updateUstadz } from "@/features/admin/ustadz/actions";

interface UstadzFormProps {
  defaultValues?: Partial<UstadzFormInput>;
  speakerId?: string;
}

export function UstadzForm({ defaultValues, speakerId }: UstadzFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugAuto, setSlugAuto] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UstadzFormInput>({
    resolver: zodResolver(ustadzFormSchema),
    defaultValues: {
      nama: "",
      slug: "",
      foto: "",
      bio: "",
      status: "ACTIVE",
      ...defaultValues,
    },
  });

  const onSubmit = (values: UstadzFormInput) => {
    startTransition(async () => {
      const result = speakerId
        ? await updateUstadz(speakerId, values)
        : await createUstadz(values);
      if (result.ok) {
        router.push("/admin/ustadz");
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

      <FormField label="Nama" required error={errors.nama?.message}>
        <Input
          {...register("nama")}
          placeholder="Nama ustadz"
          invalid={!!errors.nama}
          onChange={(e) => {
            void register("nama").onChange(e);
            if (slugAuto) setValue("slug", slugify(e.target.value));
          }}
        />
      </FormField>

      <FormField label="Slug" hint="Kosongkan untuk membuat otomatis dari nama" error={errors.slug?.message}>
        <div className="flex gap-2">
          <Input
            {...register("slug")}
            placeholder="nama-ustadz"
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
              setValue("slug", slugify(getValues("nama")), { shouldValidate: true });
            }}
            disabled={!getValues("nama")}
          >
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </FormField>

      <FormField label="Foto" hint="Tempel URL gambar eksternal (mis. dari pemateri lain atau YouTube)" error={errors.foto?.message}>
        <div className="flex flex-col gap-3">
          <Input {...register("foto")} placeholder="https://..." invalid={!!errors.foto} />
          <ImagePreview value={getValues("foto")} onChange={(url) => setValue("foto", url, { shouldValidate: true })} />
        </div>
      </FormField>

      <FormField label="Biografi" error={errors.bio?.message}>
        <Textarea {...register("bio")} rows={5} placeholder="Biografi singkat ustadz..." invalid={!!errors.bio} />
      </FormField>

      <FormField label="Status" required error={errors.status?.message}>
        <Select {...register("status")} invalid={!!errors.status}>
          <option value="ACTIVE">Published</option>
          <option value="INACTIVE">Draft</option>
        </Select>
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/ustadz")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
