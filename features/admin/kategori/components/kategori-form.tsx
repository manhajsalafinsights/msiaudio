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
import { kategoriFormSchema, type KategoriFormInput } from "@/features/admin/kategori/validation";
import { createKategori, updateKategori } from "@/features/admin/kategori/actions";

interface KategoriFormProps {
  defaultValues?: Partial<KategoriFormInput>;
  kategoriId?: string;
}

export function KategoriForm({ defaultValues, kategoriId }: KategoriFormProps) {
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
  } = useForm<KategoriFormInput>({
    resolver: zodResolver(kategoriFormSchema),
    defaultValues: { nama: "", slug: "", icon: "", ...defaultValues },
  });

  const onSubmit = (values: KategoriFormInput) => {
    startTransition(async () => {
      const result = kategoriId ? await updateKategori(kategoriId, values) : await createKategori(values);
      if (result.ok) {
        router.push("/admin/kategori");
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

      <FormField label="Nama Kategori" required error={errors.nama?.message}>
        <Input
          {...register("nama")}
          placeholder="mis. Fiqih, Aqidah, Tafsir"
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
            placeholder="nama-kategori"
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

      <FormField label="Ikon" hint="Nama ikon Lucide (opsional)" error={errors.icon?.message}>
        <Input {...register("icon")} placeholder="mis. BookOpen" invalid={!!errors.icon} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/kategori")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
