const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ARABIC_CLEAN = /[\u0600-\u06FF\s]+$/g;

function extractName(title) {
  const s = title.trim();
  const m = s.match(
    /(?:\bUstadz|\bUst\.|\bUstaz|\bUstadzah|\bSyaikh|\bSyekh|\bSheikh)(?:ah)?[\s.]*(.*?)(?:\s+-\s+|\s*[|:]\s*|$)/i,
  );
  if (!m) return null;
  let name = m[1].trim();
  name = name.replace(/[.,;:()]+$/g, "").trim();
  name = name.replace(ARABIC_CLEAN, "").trim();
  if (!name || name.length < 3) return null;
  return name;
}

const DEGREE_RE =
  /\b(ustadz|ust|ustaz|ustadzah|syaikh|syekh|sheikh|dr|drs|lc|l\.c|l\.c|ma|m\.a|m\.a|mhi|m\.h\.i|m\.h\.i|m\.sc|m\.sc|sp|pk|m\.pd|m\.pd|m\.pd\.i|m\.pd\.i|m\.m|m\.m|se|ba|b\.a|b\.a|s\.t|s\.t|s\.h|s\.h|s\.pd\.i|s\.pd\.i|m\.s\.i|m\.s\.i|m\.s\.i|th\.i|s\.th\.i|m\.th\.i|b\.a\.c|m\.a\.g|m\.a\.g|m\.h\.i|m\.h\.i|m\.h\.i|m\.kom|m\.kom|m\.phil|m\.phil|m\.hum|m\.hum|m\.si|m\.si|m\.si|ph\.d|ph\.d|drs)\b\.?/gi;

function normalize(name) {
  return name
    .replace(ARABIC_CLEAN, "")
    .replace(/[“”"']/g, "")
    .replace(DEGREE_RE, " ")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function collapse(name) {
  return normalize(name).replace(/\s+/g, "");
}

const TOPIC_BLACKLIST = [
  /^menjawab$/i,
  /^podcast$/i,
  /^tanggapan$/i,
  /^tanya$/i,
  /^bertanya$/i,
  /^ustadz$/i,
  /^ustadzah$/i,
  /ul islam/i,
  /ibnu taimiyah/i,
];

async function main() {
  const series = await prisma.series.findMany({
    select: { id: true, judul: true },
  });
  const speakers = await prisma.speaker.findMany({
    select: { id: true, nama: true },
  });

  const normMap = new Map();
  for (const sp of speakers) {
    const key = collapse(sp.nama);
    if (!normMap.has(key)) normMap.set(key, []);
    normMap.get(key).push(sp);
  }

  const byName = new Map();
  const unparseable = [];
  const stats = { matched: 0, baru: 0, topik: 0, gagal: 0 };

  for (const s of series) {
    const raw = extractName(s.judul);
    if (!raw) {
      if (/ustadz|ustaz|syaikh|syekh|sheikh/i.test(s.judul)) unparseable.push(s.judul);
      continue;
    }
    if (TOPIC_BLACKLIST.some((re) => re.test(raw))) {
      stats.topik++;
      continue;
    }
    const norm = normalize(raw);
    const key = collapse(raw);
    if (!norm || norm.length < 3) {
      stats.gagal++;
      unparseable.push(s.judul);
      continue;
    }
    if (!byName.has(key)) {
      const existing = normMap.get(key);
      byName.set(key, {
        raw: raw.trim(),
        norm,
        count: 0,
        matched: Boolean(existing?.length),
        existing: existing?.[0]?.nama ?? null,
      });
    }
    const e = byName.get(key);
    e.count++;
    if (e.matched) stats.matched++;
    else stats.baru++;
  }

  const entries = [...byName.values()].sort((a, b) => b.count - a.count);
  console.log(`=== KANDIDAT USTAZ (${entries.length} unik) ===`);
  for (const e of entries) {
    const status = e.matched ? `ADA -> ${e.existing}` : "BARU";
    console.log(`${String(e.count).padStart(4)} | ${status.padEnd(30)} | ${e.raw}`);
  }
  console.log("\n=== RINGKASAN ===");
  console.log("series ter-ekstrak (unmatched ke speaker):", stats.baru);
  console.log("series cocok speaker lama:", stats.matched);
  console.log("judul topik (dilewati):", stats.topik);
  console.log("gagal parse:", stats.gagal);
  console.log("\n=== JUDUL BER-'USTADZ' TAPI TIDAK TERPARSE ===");
  for (const t of unparseable) console.log("-", t);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});