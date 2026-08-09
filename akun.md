# Akun Login

## Akun baru

| Role | Nama | Email | Password | Dashboard |
|---|---|---|---|---|
| USER | Akun User | `akunuser@msiaudio.test` | `User12345` | `/user/dashboard` |
| ADMIN | Akun Admin | `akunadmin@msiaudio.test` | `Admin12345` | `/admin/dashboard` |

## Akun demo lama

| Role | Nama | Email | Password |
|---|---|---|---|
| USER | Pengguna Demo | `demo@msiaudio.test` | (password tersimpan, tidak diketahui) |
| ADMIN | Admin Demo | `admin@msiaudio.test` | `admin12345` |
| SUPER_ADMIN | Super Admin Demo | `superadmin@msiaudio.test` | (password tersimpan, tidak diketahui) |
| USER | Test User | `testuser01@msiaudio.test` | (password tersimpan, tidak diketahui) |

## Catatan

- Arah redirect setelah login ditentukan role (dari session/database), bukan nama akun.
- USER → `/user/dashboard`; ADMIN & SUPER_ADMIN → `/admin/dashboard`.
- Akun USER yang mengakses `/admin/*` otomatis diarahkan ke `/user/dashboard`, dan sebaliknya.
- Ambang minimum password: 8 karakter.
