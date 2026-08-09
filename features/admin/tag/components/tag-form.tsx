"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Wand2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/admin/form-field";
import { slugify } from "@/utils/slugify";
import { tagFormSchema, type TagFormInput } from "@/features/admin/tag/validation";
import { createTag, updateTag } from "@/features/admin/tag/actions";

interface TagFormProps {
  defaultValues?: Partial<TagFormInput>;
  tagId?: string;
}

export function TagForm({ defaultValues, tagId }: TagFormProps) {
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
  } = useForm<TagFormInput>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: { nama: "", slug: "", ...defaultValues },
  });

  const onSubmit = (values: TagFormInput) => {
    startTransition(async () => {
      const result = tagId ? await updateTag(tagId, values) : await createTag(values);
      if (result.ok) {
        router.push("/admin/tag");
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

      <FormField label="Nama Tag" required error={errors.nama?.message}>
        <Input
          {...register("nama")}
          placeholder="mis. Ramadhan, Adab, Haji"
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
            placeholder="nama-tag"
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

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/tag")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
