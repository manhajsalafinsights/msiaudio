/** Buat slug unik dengan menambahkan akhiran -2, -3, dst. jika sudah dipakai. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let counter = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}
