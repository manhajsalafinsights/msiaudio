# Server Actions Foundation

Pola penulisan server action untuk MSI Audio (Next.js App Router).

## Struktur

```
features/<feature>/actions/
├── <action>.ts    # Server action ("use server")
└── <action>.ts
```

## Pola Penulisan

```ts
"use server";

import { actionService } from "@/features/<feature>/services/<action>-service";
import type { ActionInput } from "@/features/<feature>/types";

export async function createAction(input: ActionInput) {
  // 1. Validasi input (Zod) — di service layer
  // 2. Panggil repository via service
  // 3. Kembalikan ActionState
  return actionService.create(input);
}
```

## Aturan

- Seluruh server action harus diawali dengan `"use server"`.
- Tidak boleh mengakses `prisma` langsung — gunakan service layer.
- Error handling: service melempar `AppError`, action mengembalikan `ActionState`.
- Gunakan `ActionState` dari `@/types/action` untuk konsistensi.
- Tidak boleh membocorkan detail internal (stack trace, query Prisma) ke client.

## Contoh

Lihat `features/auth/actions/` untuk implementasi lengkap.
