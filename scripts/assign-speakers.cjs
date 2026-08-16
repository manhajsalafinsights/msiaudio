const { PrismaClient } = require("@prisma/client");

const DRY_RUN = process.argv.includes("--write") ? false : true;

const prisma = new PrismaClient();

const ARABIC_CLEAN = /[\u0600-\u06FF\s]+$/g;

function extractNames(title) {
  const s = title.trim();
  let m = s.match(
    /(?:\bUstadzah|\bUstadz|\bUst\.|\bUstaz|\bSyaikh|\bSyekh|\bSheikh)[\s.]*(.*?)(?:\s+-\s+|\s*[|:]\s*|$)/i,
  );
  if (!m) {
    m = s.match(/\((?:Ust|Ustadz|Ustadzah|Syaikh|Syekh|Sheikh)[\s.]*([^)]+?)\)$/i);
  }
  if (!m) return null;
  const prefix = m[1] && m[0].match(/^(Ustadzah|Ustadz|Ust\.|Ustaz|Syaikh|Syekh|Sheikh)/i)?.[1];
  let name = m[1].trim();
  name = name.split("@")[0].trim();
  name = name.replace(/[“”"]/g, "");
  name = name.replace(/\s*\(.*?\)\s*$/g, "").trim();
  name = name.replace(/[.,;:]+$/g, "").trim();
  name = name.replace(ARABIC_CLEAN, "").trim();
  if (!name || name.length < 3) return null;
  return { prefix, name };
}

const DEGREE_RE =
  /\b(ustadz|ustadzah|ust|ustaz|syaikh|syekh|sheikh|prof|dr|drs|lc|l\.c|ma|m\.a|mhi|m\.h\.i|m\.sc|sp|pk|m\.pd|m\.pd\.i|m\.m|se|ba|b\.a|s\.t|s\.h|s\.pd\.i|m\.s\.i|th\.i|s\.th\.i|m\.th\.i|b\.a\.c|m\.a\.g|m\.kom|m\.phil|m\.hum|m\.si|ph\.d|s\.s|s\.sy|s\.s\.y|m\.s\.y|m\.i\.kom|s\.ip|m\.ip|m\.i\.p|s\.p\.d|m\.p\.d|s\.e|m\.e|s\.th|m\.th|m\.s\.i|m\.ag|s\.ag|m\.a\.g|m\.h\.i|m\.h\.i|m\.m|m\.m\.i|m\.i\.q|m\.q|s\.q|m\.l\.c|m\.a\.s|m\.k\.p|m\.d)\b\.?/gi;

function normalize(name) {
  return name
    .replace(ARABIC_CLEAN, "")
    .replace(DEGREE_RE, " ")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}
const collapse = (n) => normalize(n).replace(/\s+/g, "");

const TOPIC_BLACKLIST = [
  /menjawab/i,
  /podcast/i,
  /tanggapan/i,
  /^tanya$/i,
  /bertanya/i,
  /akhir zaman/i,
  /ustadz$/i,
  /ustadzah$/i,
  /ul islam/i,
  /ibnu taimiyah/i,
];

// Alias: key = collapse(nama) → { nama: canonical }
const ALIASES = {
  "muhammadabduhtuasikal": { nama: "Ustadz Muhammad Abduh Tuasikal" },
  "abduhtuasikalkitabmatanabisyuja": { nama: "Ustadz Muhammad Abduh Tuasikal" },
  "abdullahzaen": { nama: "Ustadz Abdullah Zaen, Lc., M.A" },
  "mufyhanifthalb": { nama: "Ustadz Mufy Hanif Thalib, Lc" },
  "badrusalam": { nama: "Ustadz Abu Yahya Badrusalam, Lc" },
  "abuqatadah": { nama: "Ustadz Abu Qotadah" },
  "nuruddinabufaynanalmakky": { nama: "Ustadz Nuruddin Abu Faynan" },
  "abulaswadalbayaty": { nama: "Ustadz Abul Aswad Al Bayati, B.A" },
  "abuihsanalatsary": { nama: "Ustadz Abu Ihsan Al-Atsari, MA" },
  "fandikasbaraharahap": { nama: "Ustadz Fandi Kasbara Harahap" },
  "musyaffa": { nama: "Ustadz Dr. Musyaffa' Ad-Dariny, MA" },
  "musyaffaaddariny": { nama: "Ustadz Dr. Musyaffa' Ad-Dariny, MA" },
  "zaenalabidin": { nama: "Ustadz Zainal Abdin, Lc. M.M." },
  "zainalabidin": { nama: "Ustadz Zainal Abdin, Lc. M.M." },
  "sufyanbaswedan": { nama: "Ustadz Sufyan Baswedan" },
  "erwanditirmidzi": { nama: "Ustadz Dr. Erwandi Tarmizi, M.A" },
  "ristyanragil": { nama: "Ustadz Ristiyan Ragil" },
  "abuubaidahassidawi": { nama: "Ustadz Yusuf Abu Ubaidah As-Sidawi" },
  "abuubaidahyusufas": { nama: "Ustadz Yusuf Abu Ubaidah As-Sidawi" },
  "rizalyuliar": { nama: "Ustadz Rizal Yuliar Putrananda, Lc" },
  "rizalyuliarputrananda": { nama: "Ustadz Rizal Yuliar Putrananda, Lc" },
  "hasanal": { nama: "Ustadz Hasan Al-Katiry" },
  "hasankatiry": { nama: "Ustadz Hasan Al-Katiry" },
  "ibrahimarruhaili": { nama: "Prof. Dr. Ibrahim bin 'Amir Ar-Ruhaili" },
  "ibrahimbinamirarruhaili": { nama: "Prof. Dr. Ibrahim bin 'Amir Ar-Ruhaili" },
  "abdurrazaq": { nama: "Prof. Dr. Abdurrazzaq bin Abdul Muhsin Al-'Abbad Al-Badr" },
  "abdurrazzaqbinabdulmuhsinalabbadalbadr": { nama: "Prof. Dr. Abdurrazzaq bin Abdul Muhsin Al-'Abbad Al-Badr" },
};

// Map nama canonical → existing speaker id (untuk merge ke speaker lama)
const MERGE_TO_EXISTING = {
  "Ustadz Zainal Abdin, Lc. M.M.": "cmsm68zsr0003ky046qi319t8",
  "Abu Yahya Badrusalam, Lc": "cmsm4pn13000djp0475ohyi36",
};

function slugify(nama) {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeSlug(nama) {
  return `ustadz-${slugify(nama)}`;
}

function splitMulti(name) {
  return name
    .split(/\s*&\s*|\s*,\s*(?=(?:Ustadz|Ust\.|Ustaz|Syaikh|Syekh)\b)/i)
    .map((p) => p.trim().replace(/^[,\s&]+|[,\s&]+$/g, ""))
    .filter(Boolean);
}

async function main() {
  const series = await prisma.series.findMany({
    select: { id: true, judul: true },
  });
  const speakers = await prisma.speaker.findMany({ select: { id: true, nama: true } });

  const existingByKey = new Map();
  for (const sp of speakers) existingByKey.set(collapse(sp.nama), sp);

  const plan = new Map(); // key -> { nama, seriesIds: Set }
  const skipped = [];
  const topicSkipped = [];
  const noName = [];

  for (const s of series) {
    const found = extractNames(s.judul);
    if (!found) {
      if (/ustadz|ustaz|syaikh|syekh|sheikh/i.test(s.judul)) skipped.push(s.judul);
      else noName.push(s.judul);
      continue;
    }
    const parts = splitMulti(found.name);
    let matched = false;
    for (let part of parts) {
      part = part
        .trim()
        .replace(/^(ustadz|ust|ustaz|syaikh|syekh|sheikh)[\s.]*/i, "")
        .trim();
      if (!part || TOPIC_BLACKLIST.some((re) => re.test(part))) continue;
      let key = collapse(part);
      let nama;
      if (ALIASES[key]) {
        nama = ALIASES[key].nama;
        key = collapse(nama);
      } else {
        const prefix = (found.prefix ?? "Ustadz").replace(/^Ust\.?$|^Ustaz$/i, "Ustadz");
        nama = `${prefix} ${part}`;
      }
      if (!nama || nama.length < 3) continue;
      const existing = existingByKey.get(key);
      if (existing) {
        nama = existing.nama;
      } else {
        const merged = MERGE_TO_EXISTING[nama];
        if (merged) {
          const ex = speakers.find((x) => x.id === merged);
          if (ex) {
            nama = ex.nama;
            existingByKey.set(key, ex);
          }
        }
      }
      if (!plan.has(key)) plan.set(key, { nama, seriesIds: new Set() });
      plan.get(key).seriesIds.add(s.id);
      matched = true;
    }
    if (!matched) {
      if (/ustadz|ustaz|syaikh|syekh|sheikh/i.test(s.judul)) skipped.push(s.judul);
      else noName.push(s.judul);
    }
  }

  const newSpeakers = [...plan.values()].filter((p) => !existingByKey.get(collapse(p.nama)));
  const existingSpeakers = [...plan.values()].filter((p) => existingByKey.get(collapse(p.nama)));

  console.log(`=== RENCANA (${plan.size} ustaz unik) ===`);
  console.log(`- BARU akan dibuat : ${newSpeakers.length}`);
  console.log(`- SUDAH ADA       : ${existingSpeakers.length}`);
  console.log(`- series akan dilink: ${[...plan.values()].reduce((a, p) => a + p.seriesIds.size, 0)}`);
  console.log(`- series tanpa nama ustaz di judul: ${noName.length} (dibiarkan)`);
  console.log(`- judul ber-ustadz tidak ter-ekstrak: ${skipped.length}`);

  console.log("\n=== USTAZ BARU (akan dibuat) ===");
  for (const p of [...newSpeakers].sort((a, b) => b.seriesIds.size - a.seriesIds.size)) {
    console.log(`${String(p.seriesIds.size).padStart(4)} series | ${p.nama}`);
  }
  console.log("\n=== USTAZ SUDAH ADA (akan di-link) ===");
  for (const p of [...existingSpeakers].sort((a, b) => b.seriesIds.size - a.seriesIds.size)) {
    console.log(`${String(p.seriesIds.size).padStart(4)} series | ${p.nama}`);
  }
  console.log("\n=== JUDUL BER-USTADZ TAPI TIDAK TER-EKSTRAK ===");
  for (const t of skipped) console.log("-", t);
  console.log("\n=== CONTOH JUDUL TANPA NAMA USTAZ (10 dari " + noName.length + ") ===");
  for (const t of noName.slice(0, 10)) console.log("-", t);

  if (!DRY_RUN) {
    console.log("\n=== MENULIS KE DATABASE ===");
    const usedSlugs = new Set((await prisma.speaker.findMany({ select: { slug: true } })).map((s) => s.slug));
    for (const p of plan.values()) {
      let sp = existingByKey.get(collapse(p.nama));
      if (!sp) {
        let slug = makeSlug(p.nama);
        let base = slug;
        let i = 2;
        while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
        sp = await prisma.speaker.create({
          data: { nama: p.nama, slug },
        });
        usedSlugs.add(slug);
        existingByKey.set(collapse(p.nama), sp);
        console.log("  + speaker baru:", p.nama, "->", slug);
      }
      await prisma.seriesSpeaker.createMany({
        data: [...p.seriesIds].map((seriesId) => ({ seriesId, speakerId: sp.id, order: 0 })),
        skipDuplicates: true,
      });
      console.log(`  ~ link ${p.seriesIds.size} series -> ${p.nama}`);
    }
    console.log("SELESAI.");
  } else {
    console.log("\n[DRY-RUN] Tidak ada perubahan. Jalankan dengan `node scripts/assign-speakers.cjs --write` untuk menulis.");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});