import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import PetaDomisili from "@/components/PetaDomisili/PetaDomisili";
import SectionDivider from "@/components/SectionDivider";
import CavalleryGallery from "@/components/about/CavalleryGallery";

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
              <Link 
                href="/join" 
                className="btnPrimary"
              >
                <i className="bx bxs-user-plus" /> Bergabung dengan Cavallery
              </Link>
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

        {/* Filosofi Logo & Ornamen */}
        <div className={styles.filosofiSection}>
          <div className="badge" style={{ marginBottom: 16 }}>
            <i className="bx bx-shield-quarter" /> Filosofi Logo
          </div>
          <h2 className={styles.sectionH} style={{ textAlign: "center" }}>
            Makna & Filosofi <span className="textGold">Logo Cavallery</span>
          </h2>
          <div className="divider" style={{ marginBottom: 32 }} />

          {/* Featured: Emblem Card */}
          <div className={styles.filosofiEmblemCard}>
            <div className={styles.filosofiEmblemImgWrap}>
              <Image
                src="/images/about/filosofi-emblem.jpg"
                alt="Emblem Cavallery"
                width={500}
                height={375}
                className={styles.filosofiEmblemImg}
                priority
              />
            </div>
            <div className={styles.filosofiEmblemBody}>
              <div className="badge" style={{ width: "fit-content" }}>
                <i className="bx bxs-shield" /> Fondasi & Identitas
              </div>
              <h3 className={styles.filosofiEmblemTitle}>Emblem Cavallery</h3>
              <div className={styles.medievalDivider}>
                <span>❖</span>
              </div>
              <p className={styles.filosofiEmblemDesc}>
                Badan utama yang mengikat semua ornamen menjadi satu kesatuan. Emblem dijadikan fondasi dalam logo kami, 
                agar sejalan dengan keseluruhan tema <strong>"Medieval"</strong> atau <strong>"Abad Pertengahan"</strong> yang kami usung.
              </p>
              <div className={styles.filosofiEmblemHighlight}>
                <i className="bx bx-info-circle" style={{ marginRight: 6, color: "var(--gold)" }} />
                Bagian pinggir emblem juga dibuat tertutup oleh bagian moncong kuda agar bingkainya (bagian emas) membentuk huruf <strong>C</strong> (Cavallery & Catherina).
              </div>
              <p className={styles.filosofiEmblemDesc}>
                Bentuk perisai melambangkan perlindungan dan kekuatan, sementara sosok kuda menjadi simbol utama Cavallery yang menggambarkan keberanian, kebebasan, dan semangat untuk terus melangkah bersama dalam mendukung Erine.
              </p>
            </div>
          </div>

          {/* Grid Ornaments: Mahkota, Kuda, Warna Emas, Warna Biru */}
          <div className={styles.filosofiGrid}>
            {/* 1. Mahkota */}
            <div className={`glassCard ${styles.filosofiCard}`}>
              <div className={styles.filosofiCardHeader}>
                <div className={styles.filosofiIconWrap}>
                  <i className="bx bx-crown" />
                </div>
                <div>
                  <div className="badge" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>Simbol Kejayaan</div>
                  <h4 className={styles.filosofiCardTitle}>Mahkota</h4>
                </div>
              </div>
              <div className={styles.medievalDivider}>
                <span>❖</span>
              </div>
              <p className={styles.filosofiCardDesc}>
                Simbol kekuatan, kemenangan, dan kejayaan. Ornamen ini juga memiliki bentuk seperti <strong>"Benteng"</strong> yang melambangkan perlindungan, ketangguhan, dan kekokohan.
              </p>
              <p className={styles.filosofiCardDesc} style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                Bentuk mahkota menggambarkan sebuah kerajaan yang menjadi tempat berkumpulnya Cavallery dalam satu tujuan dan ikatan yang sama untuk terus berkembang.
              </p>
            </div>

            {/* 2. Kuda */}
            <div className={`glassCard ${styles.filosofiCard}`}>
              <div className={styles.filosofiCardHeader}>
                <div className={styles.filosofiIconWrap}>
                  <i className="bx bx-shield-quarter" />
                </div>
                <div>
                  <div className="badge" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>Ksatria & Pelindung</div>
                  <h4 className={styles.filosofiCardTitle}>Kuda</h4>
                </div>
              </div>
              <div className={styles.medievalDivider}>
                <span>❖</span>
              </div>
              <p className={styles.filosofiCardDesc}>
                Simbol kemandirian, kebebasan, keluhuran, kepercayaan diri, keberanian, jiwa kompetitif, dan semangat juang.
              </p>
              <p className={styles.filosofiCardDesc} style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                Kuda menjadi representasi utama Cavallery, menggambarkan perjalanan kami yang terus bergerak maju bersama Erine dalam setiap langkahnya.
              </p>
            </div>

            {/* 3. Warna Emas */}
            <div className={`glassCard ${styles.filosofiCard}`}>
              <div className={styles.filosofiCardHeader}>
                <div className={styles.filosofiIconWrap} style={{ background: "rgba(212, 175, 55, 0.15)", color: "#d4af37" }}>
                  <i className="bx bxs-sun" />
                </div>
                <div>
                  <div className="badge" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>Kemakmuran & Kenangan</div>
                  <h4 className={styles.filosofiCardTitle}>Warna Emas</h4>
                </div>
              </div>
              <div className={styles.medievalDivider}>
                <span>❖</span>
              </div>
              <p className={styles.filosofiCardDesc}>
                Lambang kesuksesan, kemakmuran, kehangatan, kejayaan, dan kenangan berharga. Warna emas menggambarkan setiap momen dan perjalanan yang menjadi bagian penting dari cerita Cavallery.
              </p>
              <div className={styles.colorPreviewRow}>
                <div className={`${styles.colorSwatch} ${styles.colorSwatchGold}`}>
                  <span>Royal Gold (#D4AF37)</span>
                </div>
              </div>
            </div>

            {/* 4. Warna Biru */}
            <div className={`glassCard ${styles.filosofiCard}`}>
              <div className={styles.filosofiCardHeader}>
                <div className={styles.filosofiIconWrap} style={{ background: "rgba(30, 58, 138, 0.15)", color: "#3b82f6" }}>
                  <i className="bx bxs-droplet" />
                </div>
                <div>
                  <div className="badge" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>Ketenangan & Kesetiaan</div>
                  <h4 className={styles.filosofiCardTitle}>Warna Biru</h4>
                </div>
              </div>
              <div className={styles.medievalDivider}>
                <span>❖</span>
              </div>
              <p className={styles.filosofiCardDesc}>
                Lambang ketenangan, kestabilan, inspirasi, kebijaksanaan, kesetiaan, kepercayaan, dan kebersamaan. Warna biru menggambarkan ikatan Cavallery yang selalu hadir untuk memberikan dukungan dalam setiap perjalanan Erine.
              </p>
              <div className={styles.colorPreviewRow}>
                <div className={`${styles.colorSwatch} ${styles.colorSwatchBlueDark}`}>
                  <span>Deep Blue</span>
                </div>
                <div className={`${styles.colorSwatch} ${styles.colorSwatchBlueLight}`}>
                  <span>Ocean Blue</span>
                </div>
              </div>
            </div>
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

        {/* Galeri Foto */}
        <CavalleryGallery />

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
