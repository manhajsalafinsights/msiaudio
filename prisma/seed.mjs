// ============================================================
// MSI Audio — Seed (data dasar untuk development)
// Idempoten: aman dijalankan berulang (upsert by slug/email).
//   npx prisma db seed
//
// Hanya mengisi data struktural:
//   - Series Type
//   - Category
//   - Tag
//   - Speaker (minimal)
//   - User demo (berbagai role)
//
// JANGAN memasukkan data kajian asli (series, audio, dll).
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  // ---- Series Type -------------------------------------------------------
  // Sesuai PRD: Kajian Kitab, Dauroh, Podcast, Seminar, Tematik, Ramadhan, Kajian Singkat.
  for (const nama of [
    "Kajian Kitab",
    "Dauroh",
    "Podcast",
    "Seminar",
    "Tematik",
    "Ramadhan",
    "Kajian Singkat",
  ]) {
    await prisma.seriesType.upsert({
      where: { slug: slugify(nama) },
      update: {},
      create: { nama, slug: slugify(nama) },
    });
  }

  // ---- Category ----------------------------------------------------------
  // Sesuai PRD: Tauhid, Aqidah, Fiqih, Hadits, Akhlak, Al-Qur'an.
  for (const nama of ["Tauhid", "Aqidah", "Fiqih", "Hadits", "Akhlak", "Al-Qur'an"]) {
    await prisma.category.upsert({
      where: { slug: slugify(nama) },
      update: {},
      create: { nama, slug: slugify(nama) },
    });
  }

  // ---- Tag ---------------------------------------------------------------
  for (const slug of ["akidah", "ibadah", "thaharah", "adab-sehari-hari", "akhlak", "ushul"]) {
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { nama: slug.replace(/-/g, " "), slug },
    });
  }

  // ---- Speaker (minimal — struktur saja) ---------------------------------
  for (const nama of ["Ustadz Ahmad Zainuddin, Lc.", "Ustadz Muhammad Abdullah"]) {
    await prisma.speaker.upsert({
      where: { slug: slugify(nama) },
      update: {},
      create: { nama, slug: slugify(nama), bio: "Pengajar tetap Manhaj Salaf Insights." },
    });
  }

  // ---- User Demo ---------------------------------------------------------
  // User biasa — tidak bisa login (tanpa Account/password).
  await prisma.user.upsert({
    where: { email: "demo@msiaudio.test" },
    update: {},
    create: {
      name: "Pengguna Demo",
      email: "demo@msiaudio.test",
      emailVerified: true,
    },
  });

  // ---- Admin dengan Password --------------------------------------------
  // Gunakan Better Auth API untuk membuat user + password hash yang valid.

  const adminEmail = "admin@msiaudio.test";
  const adminPassword = "admin12345"; // minimal 8 karakter
  const superAdminEmail = "superadmin@msiaudio.test";
  const superAdminPassword = "super12345";

  // Hash password menggunakan algoritma yang sama dengan Better Auth
  const { hashPassword } = await import("@better-auth/utils/password");

  // Buat Admin user + account
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      name: "Admin Demo",
      email: adminEmail,
      emailVerified: true,
      role: "ADMIN",
    },
  });
  const adminHash = await hashPassword(adminPassword);
  await prisma.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: adminUser.id } },
    update: { password: adminHash },
    create: {
      userId: adminUser.id,
      providerId: "credential",
      accountId: adminUser.id,
      password: adminHash,
    },
  });

  // Buat Super Admin user + account
  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: "SUPER_ADMIN" },
    create: {
      name: "Super Admin Demo",
      email: superAdminEmail,
      emailVerified: true,
      role: "SUPER_ADMIN",
    },
  });
  const superAdminHash = await hashPassword(superAdminPassword);
  await prisma.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: superAdminUser.id } },
    update: { password: superAdminHash },
    create: {
      userId: superAdminUser.id,
      providerId: "credential",
      accountId: superAdminUser.id,
      password: superAdminHash,
    },
  });

  console.log("Seed selesai. Data dasar telah dimasukkan.");
  console.log("");
  console.log("=== AKUN ADMIN DEMO ===");
  console.log(`Admin:      ${adminEmail} / ${adminPassword}`);
  console.log(`Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log("========================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
