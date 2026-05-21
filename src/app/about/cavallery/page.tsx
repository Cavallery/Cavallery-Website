import type { Metadata } from "next";
import styles from "./page.module.css";
import PetaDomisili from "@/components/PetaDomisili/PetaDomisili";
import SectionDivider from "@/components/SectionDivider";

export const metadata: Metadata = {
  title: "About Cavallery",
  description:
    "Mengenal lebih jauh tentang Cavallery, komunitas resmi penggemar Erine JKT48 yang berdiri sejak 2024.",
};


const values = [
  { icon: "bx-heart", title: "Dedication", desc: "Kami berkomitmen penuh untuk mendukung perjalanan Erine sebagai idol." },
  { icon: "bx-shield", title: "Respect", desc: "Menghormati privasi dan batasan Erine serta keluarganya." },
  { icon: "bx-bulb", title: "Creativity", desc: "Mengekspresikan dukungan melalui karya kreatif dan proyek inovatif." },
  { icon: "bx-group", title: "Community", desc: "Membangun komunitas yang positif, inklusif, dan saling mendukung." },
];

export default function AboutCavalleryPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bxs-star" /> Official Fanbase</div>
          <h1 className={styles.heroTitle}>
            Tentang <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroSub}>
            Komunitas resmi penggemar Erine JKT48 — terdiri dari individu-individu 
            yang bersatu dalam satu misi: mendukung Erine sepenuh hati.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Mission */}
        <div className={styles.missionWrap}>
          <div className={styles.missionText}>
            <div className="badge" style={{ marginBottom: 16 }}>
              <i className="bx bx-target-lock" /> Misi Kami
            </div>
            <h2 className={styles.sectionH}>Kami Ada untuk Erine</h2>
            <div className="divider" />
            <p>
              Cavallery adalah fanbase utama dari <strong>Catherina Vallencia (Erine)</strong>, 
              member inti JKT48 generasi ke-12 di Tim Passion. Nama Cavallery merupakan singkatan 
              kreatif dari nama panggilan Erine, sekaligus plesetan dari kata kavaleri 
              pasukan berkuda yang melambangkan kekuatan dan kesetiaan.
            </p>
            <p>
              Layaknya kavaleri, kami adalah barisan pelindung Erine, selalu siap mendukungnya 
              di setiap langkah perjuangannya. Kuda juga merujuk pada pion unik dalam permainan 
              catur, selaras dengan jikoshoukai Erine yang menyebutkan "checkmate" sebuah 
              simbol kemenangan dalam strategi.
            </p>
            <div style={{ marginTop: 32 }}>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeOs9IDpoOzifnSgBGFvj74MSbyGb7gu_r6ntG5fjV0znVLkQ/closedform" 
                target="_blank" 
                rel="noreferrer" 
                className="btnPrimary"
              >
                <i className="bx bxs-user-plus" /> Bergabung dengan Cavallery
              </a>
            </div>
          </div>

          {/* Values */}
          <div className={styles.values}>
            {values.map((v) => (
              <div key={v.title} className={`glassCard ${styles.valueCard}`}>
                <i className={`bx ${v.icon} ${styles.valueIcon}`} />
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* Sebaran Domisili */}
        <div className={styles.domisiliSection}>
          <div className="badge" style={{ marginBottom: 16 }}>
            <i className="bx bx-map-alt" /> Sebaran Domisili
          </div>
          <h2 className={styles.sectionH}>Domisili Anggota Cavallery</h2>
          <div className="divider" style={{ marginBottom: 32 }} />
          <PetaDomisili />
        </div>

        <SectionDivider />

        {/* Peraturan Umum */}
        <div className={styles.domisiliSection}>
          <div className="badge" style={{ marginBottom: 16 }}>
            <i className="bx bx-check-shield" /> Rules
          </div>
          <h2 className={styles.sectionH}>Peraturan Anggota Grup Cavallery</h2>
          <div className="divider" style={{ marginBottom: 32 }} />
          <div className="glassCard" style={{ padding: "30px 40px", textAlign: "left", lineHeight: "1.8", margin: "0 auto", maxWidth: 800 }}>
            <ol style={{ paddingLeft: 20, color: "var(--fg-muted)", listStyleType: "decimal" }}>
              <li style={{ marginBottom: 8, paddingLeft: 8 }}>Mohon untuk aktif dan tidak memancing keributan di grup Cavallery.</li>
              <li style={{ marginBottom: 8 }}>Dilarang menghina atau melakukan hate speech kepada sesama anggota grup, Erine, atau member JKT48 lainnya.</li>
              <li style={{ marginBottom: 8 }}>Mohon bantuannya untuk berpartisipasi dalam setiap project Cavallery, baik melalui media sosial maupun langsung di lapangan.</li>
              <li style={{ marginBottom: 8 }}>Setiap project akan melalui proses brainstorming secara online/offline bersama seluruh anggota grup sebelum diumumkan kembali di grup ini.</li>
              <li style={{ marginBottom: 8 }}>Diharapkan membayar uang kas sesuai standar minimum yang sudah ditetapkan untuk melancarkan project-project Cavallery (detail pembayaran kas akan dijelaskan di catatan terpisah).</li>
              <li style={{ marginBottom: 8 }}>Bagi yang tidak membayar kas selama 1 bulan akan diberi peringatan.</li>
              <li style={{ marginBottom: 8 }}>Bagi yang tidak membayar kas selama 2 bulan berturut-turut akan diberi peringatan dan ditindak (dikeluarkan).</li>
              <li style={{ marginBottom: 8 }}>Penagihan kas akan dilakukan setiap tanggal 25.</li>
              <li style={{ marginBottom: 8 }}>Bagi yang ingin promosi jualan, harap menghubungi pengurus terlebih dahulu.</li>
              <li style={{ marginBottom: 8 }}>Hanya pengurus yang dapat mengundang atau mengeluarkan anggota dari grup ini (semua anggota grup harus mengisi formulir).</li>
              <li style={{ marginBottom: 8 }}>Hanya pengurus yang boleh menggunakan tag all di grup.</li>
              <li style={{ marginBottom: 8 }}>Jika ada yang ingin ditanyakan, silakan menghubungi @MinCav atau @JENDERAL CAVALLERY melalui grup atau personal chat.</li>
              <li style={{ marginBottom: 8 }}>Dilarang menghapus album yang ada di grup Line (ini merupakan pelanggaran berat yang dapat dikenai sanksi berat).</li>
              <li style={{ marginBottom: 8 }}>Dilarang menyebarkan link Discord keluar dari grup ini.</li>
              <li style={{ marginBottom: 8 }}>Pengurus berhak memutuskan peraturan tambahan dengan kesepakatan para pengurus lainnya.</li>
            </ol>
          </div>
        </div>

        <SectionDivider />

        {/* Canva Presentation */}
        <div className={styles.domisiliSection}>
          <div className="badge" style={{ marginBottom: 16 }}>
            <i className="bx bx-group" /> Kepengurusan
          </div>
          <h2 className={styles.sectionH}>Struktur Organisasi Cavallery</h2>
          <div className="divider" style={{ marginBottom: 16 }} />
          <p style={{ color: "var(--fg-dim)", marginBottom: 32, maxWidth: 600, marginInline: "auto", textAlign: "center" }}>
            Struktur kepengurusan resmi, program kerja, dan peta strategis Cavallery.id dalam mengorganisasi dukungan bagi Erine JKT48 secara berkelanjutan.
          </p>
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)" }}>
            <iframe
              src="https://www.canva.com/design/DAGphhh5yG4/PQzSLf0zIpCM_G3-KeHVEA/view?embed"
              title="Struktur Kepengurusan Cavallery"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>

      </div>
    </div>
  );
}
