"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Wand2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/admin/form-field";
import { slugify } from "@/utils/slugify";
import { kitabFormSchema, type KitabFormInput } from "@/features/admin/kitab/validation";
import { createKitab, updateKitab } from "@/features/admin/kitab/actions";

interface KitabFormProps {
  defaultValues?: Partial<KitabFormInput>;
  kitabId?: string;
}

export function KitabForm({ defaultValues, kitabId }: KitabFormProps) {
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
  } = useForm<KitabFormInput>({
    resolver: zodResolver(kitabFormSchema),
    defaultValues: { nama: "", slug: "", icon: "", description: "", ...defaultValues },
  });

  const onSubmit = (values: KitabFormInput) => {
    startTransition(async () => {
      const result = kitabId ? await updateKitab(kitabId, values) : await createKitab(values);
      if (result.ok) {
        router.push("/admin/kitab");
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

      <FormField label="Nama Kitab" required error={errors.nama?.message}>
        <Input
          {...register("nama")}
          placeholder="Nama kitab / jenis kajian"
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
            placeholder="nama-kitab"
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

      <FormField label="Icon (URL)" hint="URL gambar icon kitab" error={errors.icon?.message}>
        <Input {...register("icon")} placeholder="https://..." invalid={!!errors.icon} />
      </FormField>

      <FormField label="Deskripsi" error={errors.description?.message}>
        <Textarea {...register("description")} rows={4} placeholder="Deskripsi kitab..." invalid={!!errors.description} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/kitab")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
