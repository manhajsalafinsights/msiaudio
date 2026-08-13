export type LegalSection = {
  heading?: string;
  paragraphs: string[];
};

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const aboutDoc: LegalDoc = {
  title: "Tentang",
  updated: "Diperbarui: 13 Agustus 2026",
  intro:
    "MSI Audio adalah platform belajar berbasis audio kajian Islam dari ekosistem Manhaj Salaf Insights.",
  sections: [
    {
      paragraphs: [
        "MSI Audio menyajikan rekaman kajian, penjelasan kitab, dan materi ilmiah dalam bentuk audio yang mudah diakses kapan pun dan di perangkat mana pun. Semua konten dikurasi agar sesuai dengan manhaj salaf dan disusun berdasarkan tema, kitab, dan pemateri.",
      ],
    },
    {
      heading: "Fitur Utama",
      paragraphs: [
        "Pencarian dan penjelajahan: temukan kajian berdasarkan judul, pemateri, kitab, atau kategori.",
        "Series dan kitab: materi yang berkesinambungan dikelompokkan agar mudah diikuti dari awal sampai selesai.",
        "Lanjutkan belajar: riwayat pemutaran tersimpan, sehingga Anda dapat melanjutkan dari titik terakhir di perangkat mana pun.",
        "Bookmark: tandai audio favorit untuk didengarkan kembali.",
      ],
    },
    {
      heading: "Sifat Layanan",
      paragraphs: [
        "MSI Audio adalah layanan gratis. Kami berkomitmen menjaga kualitas dan kelengkapan materi, serta senantiasa menyempurnakan layanan ini. Informasi dalam layanan ini disajikan apa adanya dan dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu.",
      ],
    },
  ],
};

export const privacyDoc: LegalDoc = {
  title: "Kebijakan Privasi",
  updated: "Diperbarui: 13 Agustus 2026",
  intro:
    "Kebijakan ini menjelaskan bagaimana MSI Audio mengumpulkan, menggunakan, dan melindungi data Anda.",
  sections: [
    {
      heading: "Data yang Kami Kumpulkan",
      paragraphs: [
        "Layanan ini dapat dikunjungi tanpa akun. Untuk mendukung fitur pemutaran lanjutan (continue listening) dan bookmark, kami menyimpan data penggunaan secara lokal di perangkat Anda, antara lain: posisi terakhir pemutaran, daftar audio yang telah didengarkan, dan bookmark yang Anda buat.",
        "Kami juga dapat mencatat data teknis standar seperti jenis perangkat, browser, dan halaman yang dikunjungi, yang digunakan semata-mata untuk meningkatkan kinerja dan kestabilan layanan.",
      ],
    },
    {
      heading: "Penggunaan Data",
      paragraphs: [
        "Data yang kami kumpulkan hanya digunakan untuk: menyediakan dan mengoperasikan layanan; menyimpan preferensi dan riwayat belajar Anda; serta memperbaiki pengalaman penggunaan. Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga.",
      ],
    },
    {
      heading: "Cookie dan Penyimpanan Lokal",
      paragraphs: [
        "Kami menggunakan penyimpanan lokal browser untuk menyimpan riwayat belajar. Anda dapat menghapus data tersebut kapan saja melalui pengaturan browser Anda.",
      ],
    },
    {
      heading: "Keamanan",
      paragraphs: [
        "Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data dari akses, perubahan, atau pengungkapan yang tidak sah. Meskipun demikian, tidak ada metode transmisi atau penyimpanan data yang sepenuhnya aman, sehingga kami tidak dapat menjamin keamanan absolut.",
      ],
    },
    {
      heading: "Perubahan Kebijakan",
      paragraphs: [
        "Kebijakan ini dapat diperbarui dari waktu ke waktu. Perubahan signifikan akan ditampilkan di halaman ini. Dengan terus menggunakan layanan ini, Anda dianggap menyetujui kebijakan yang berlaku saat itu.",
      ],
    },
  ],
};

export const termsDoc: LegalDoc = {
  title: "Syarat & Ketentuan",
  updated: "Diperbarui: 13 Agustus 2026",
  intro:
    "Dengan mengakses atau menggunakan MSI Audio, Anda menyetujui syarat dan ketentuan berikut.",
  sections: [
    {
      heading: "Penggunaan Layanan",
      paragraphs: [
        "Layanan ini disediakan untuk penggunaan pribadi dan nonkomersial dalam mempelajari materi kajian Islam. Anda tidak diperbolehkan menyalahgunakan layanan, termasuk namun tidak terbatas pada: mengambil konten secara massal, mengganggu kinerja layanan, atau menggunakan layanan untuk tujuan yang melanggar hukum.",
      ],
    },
    {
      heading: "Hak Kekayaan Intelektual",
      paragraphs: [
        "Seluruh konten di dalam layanan ini, termasuk audio, judul, dan susunan materi, dilindungi oleh hak cipta dan hak terkait. Penggandaan, pendistribusian, atau penerbitan ulang konten tanpa izin tertulis dilarang, kecuali untuk keperluan pribadi.",
      ],
    },
    {
      heading: "Ketepatan Informasi",
      paragraphs: [
        "Kami berupaya menyajikan informasi dan materi yang akurat dan lengkap, namun tidak menjamin bebas dari kekurangan atau kesalahan. Penggunaan materi kajian tetap bertanggung jawab pada pendengar untuk memverifikasi kebenaran ilmiahnya dengan ahlinya.",
      ],
    },
    {
      heading: "Ketersediaan Layanan",
      paragraphs: [
        "Kami berhak mengubah, menangguhkan, atau menghentikan sebagian atau seluruh layanan kapan saja tanpa pemberitahuan, termasuk menambahkan atau menghapus materi.",
      ],
    },
    {
      heading: "Batasan Tanggung Jawab",
      paragraphs: [
        "Sejauh diizinkan oleh hukum, MSI Audio tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan ini.",
      ],
    },
    {
      heading: "Perubahan Ketentuan",
      paragraphs: [
        "Syarat dan ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan akan berlaku sejak ditampilkan di halaman ini. Jika Anda keberatan dengan perubahan tersebut, Anda dapat berhenti menggunakan layanan ini.",
      ],
    },
  ],
};

export const legalDocs: Record<string, LegalDoc> = {
  "/tentang": aboutDoc,
  "/kebijakan-privasi": privacyDoc,
  "/syarat-ketentuan": termsDoc,
};