const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEGREE_RE =
  /\b(ustadz|ustadzah|ust|ustaz|syaikh|syekh|sheikh|prof|dr|drs|lc|l\.c|ma|m\.\s*a|m\.a|mhi|m\.\s*h\.\s*i|m\.h\.i|m\.\s*sc|m\.sc|sp|pk|m\.\s*pd|m\.pd|m\.\s*pd\.\s*i|m\.pd\.i|m\.\s*m|m\.m|se|ba|b\.\s*a|b\.a|s\.\s*t|s\.t|s\.\s*h|s\.h|s\.\s*pd\.\s*i|s\.pd\.i|m\.\s*s\.\s*i|m\.s\.i|th\.i|s\.\s*th\.\s*i|s\.th\.i|m\.\s*th\.\s*i|m\.th\.i|b\.a\.c|m\.\s*a\.\s*g|m\.a\.g|m\.\s*kom|m\.kom|m\.\s*phil|m\.phil|m\.\s*hum|m\.hum|m\.\s*si|m\.si|ph\.\s*d|ph\.d|s\.\s*s|s\.s|s\.\s*sy|s\.sy|s\.\s*s\.\s*y|s\.s\.y|m\.\s*s\.\s*y|m\.s\.y|m\.i\.kom|s\.\s*ip|s\.ip|m\.\s*ip|m\.ip|s\.\s*p\.\s*d|s\.p\.d|m\.\s*p\.\s*d|m\.p\.d|s\.\s*e|s\.e|m\.\s*e|m\.e|s\.\s*th|s\.th|m\.\s*th|m\.th|m\.\s*ag|m\.ag|s\.\s*ag|s\.ag|m\.\s*i\.\s*q|m\.i\.q|m\.\s*q|m\.q|s\.\s*q|s\.q|m\.l\.c|m\.\s*a\.\s*s|m\.a\.s|m\.\s*k\.\s*p|m\.k\.p|m\.\s*d|m\.d|msi|m\.\s*si)\b\.?/gi;

function normalize(name) {
  return name
    .replace(/[“”"']/g, "")
    .replace(DEGREE_RE, " ")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}
const collapse = (n) => normalize(n).replace(/\s+/g, "");

const FIX_NAME = {
  "Ustadz Abu Hafidzah Irfan. MSI": "Ustadz Abu Hafidzah Irfan, MSI",
};

// merge: nama yang akan dihapus -> nama kanonik yang dipertahankan
const MERGES = [
  ["Ustadz Abdullah Zaen, M. A.", "Ustadz Abdullah Zaen, Lc., M.A"],
  ["Syaikh Sulaiman As Ruhaily", "Syaikh Sulaiman Ar-Ruhaili"],
  ["Ustadz Abu Ghozie", "Ustadz Abu Ghozie as Sundawie"],
  ["Ustadz Abu Haidar", "Ustadz Abu Haidar As Sundawy"],
  ["Ustadz Abdul Hakim Amir Abdat", "Ustadz. Abdul Hakim Bin Amir Abdat"],
  ["Ustadz Aunur Rofiq", "Ustadz Aunur Rofiq Ghufran,Lc"],
];

async function findByName(nama) {
  const rows = await prisma.speaker.findMany({
    where: { nama },
    select: { id: true, nama: true },
  });
  return rows;
}

async function main() {
  const all = await prisma.speaker.findMany({ select: { id: true, nama: true, slug: true } });

  console.log("=== MERGE MANUAL ===");
  for (const [from, to] of MERGES) {
    const fromList = await findByName(from);
    const toList = await findByName(to);
    const src = fromList[0];
    const dst = toList[0];
    if (!src || !dst) {
      console.log(`SKIP: "${from}" -> "${to}" (src=${fromList.length}, dst=${toList.length})`);
      continue;
    }
    await prisma.seriesSpeaker.updateMany({
      where: { speakerId: src.id },
      data: { speakerId: dst.id },
    });
    const n = await prisma.seriesSpeaker.count({ where: { speakerId: dst.id } });
    await prisma.speaker.delete({ where: { id: src.id } });
    console.log(`OK: "${from}" (${src.id}) digabung ke "${to}" — total series ${n}`);
  }

  // Rename nama bermasalah
  for (const [oldName, newName] of Object.entries(FIX_NAME)) {
    const r = await prisma.speaker.updateMany({
      where: { nama: oldName },
      data: { nama: newName },
    });
    if (r.count) console.log(`RENAME: "${oldName}" -> "${newName}"`);
  }

  console.log("\n=== CEK DUPLIKAT (collapse key) ===");
  const groups = new Map();
  for (const sp of all) {
    const key = collapse(sp.nama);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(sp.nama);
  }
  let dupFound = false;
  for (const [key, names] of groups) {
    if (names.length > 1) {
      dupFound = true;
      console.log(`DUP [${key}]: ${names.join(" | ")}`);
    }
  }
  if (!dupFound) console.log("Tidak ada duplikat berbasis collapse.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});