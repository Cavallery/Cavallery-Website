import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import SectionDivider from "@/components/SectionDivider";

export const metadata = {
  title: "Request Hour 2026 | Cavallery",
  description: "Peringkat lagu-lagu Erine di JKT48 Request Hour 2026."
};

export default function RequestHour2026Page() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Request Hour 2026</h1>
          <p className={styles.subtitle}>Peringkat Erine JKT48</p>
        </div>
      </section>

      <SectionDivider />

      {/* Recap Section */}
      <section className={styles.recapSection}>
        <div className={styles.container}>
          <div className={styles.recapHeader}>
            <div className={styles.sectionHeader}>
              <h2>THE MEMORY WE CREATE</h2>
              <div className={styles.divider}></div>
            </div>
            <img 
              src="https://pbs.twimg.com/media/HNu1mIWboAAKuyn?format=jpg&name=large" 
              alt="The Memory We Create" 
              className={styles.recapHeroImage}
            />
            <h3>Request Hour 2026 Final Recap</h3>
            <div className={styles.recapText}>
              <p>Ketika Request Hour 2026 berakhir, yang tersisa bukan hanya hasil yang tertulis di layar.</p>
              <p>Yang tersisa adalah cerita yang berhasil kita ciptakan bersama.</p>
              <p>Karena pada akhirnya, kenangan tidak tercipta saat sebuah mimpi terwujud. Kenangan tercipta saat ada banyak orang yang memilih untuk memperjuangkannya bersama.</p>
              <p>Dan Request Hour 2026 menjadi salah satu kenangan tersebut.</p>
              <p>Melalui artikel ini, kita akan kembali menelusuri perjalanan #Memory yang telah kita lalui bersama.</p>
            </div>
          </div>

          <div className={styles.sectionHeader} style={{ marginTop: '60px' }}>
            <h2>Peringkat Lagu Erine</h2>
            <div className={styles.divider}></div>
          </div>
          
          <div className={styles.galleryGrid} style={{ marginBottom: '60px' }}>
            {/* Rank 33 */}
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.rankBadge}>33</div>
                {/* 
                  Ganti src di bawah ini dengan gambar asli nantinya. 
                  Pastikan menaruh gambar di folder public/images/
                */}
                <img 
                  src="https://pbs.twimg.com/media/HKxWODGa4AALMI2?format=jpg&name=large" 
                  alt="Kinjirareta Futari" 
                  className={styles.image} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h3>Kinjirareta Futari</h3>
              <div className={styles.votes}>Rank 33</div>
            </div>
            
            {/* Rank 12 */}
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.rankBadge}>12</div>
                {/* 
                  Ganti src di bawah ini dengan gambar asli nantinya. 
                  Pastikan menaruh gambar di folder public/images/
                */}
                <img 
                  src="https://pbs.twimg.com/media/HKxWFmfaMAA3ud1?format=jpg&name=large" 
                  alt="Bibir Yang Telah Dicuri" 
                  className={styles.image} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h3>Bibir yang telah dicuri</h3>
              <div className={styles.votes}>Rank 12</div>
            </div>

            {/* Rank 6 */}
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.rankBadge}>6</div>
                {/* 
                  Ganti src di bawah ini dengan gambar asli nantinya. 
                  Pastikan menaruh gambar di folder public/images/
                */}
                <img 
                  src="https://pbs.twimg.com/media/HKxWFmbawAEJ13P?format=jpg&name=large" 
                  alt="Blue Rose" 
                  className={styles.image} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h3>Blue Rose</h3>
              <div className={styles.votes}>Rank 6</div>
            </div>
          </div>

          <div className={styles.recapBlock}>
            <h3>A Memory On Stage</h3>
            <div className={styles.recapText}>
              <p>Setiap perjalanan pada akhirnya akan menemukan tujuannya masing-masing.</p>
              <p>Bagi kita, salah satu tujuan tersebut hadir ketika melihat Erine berdiri di atas panggung JKT48 Request Hour 2026 dan menjadi bagian dari lagu-lagu yang berhasil dibawakan tahun ini.</p>
              <p>Melalui dukungan yang diberikan sepanjang periode Request Hour, Erine berkesempatan membawakan:</p>
              <ul className={styles.songList}>
                <li>🌹 #6 Blue Rose</li>
                <li>💋 #12 Nusumareta Kuchibiru</li>
                <li>🔒 #33 Kinjirareta Futari</li>
              </ul>
              <p>Setiap lagu membawa cerita dan kenangannya masing-masing. Namun di balik ketiganya, terdapat satu hal yang sama: dukungan dari begitu banyak orang yang memilih untuk berjalan bersama sepanjang perjalanan ini.</p>
              <p>Melihat Erine menjadi bagian dari ketiga lagu tersebut menjadi pengingat bahwa setiap suara yang diberikan memiliki arti, dan setiap dukungan yang dititipkan mampu membawa kita selangkah lebih dekat kepada momen yang ingin kita wujudkan bersama.</p>
              <p>Dan pada Request Hour 2026, momen itu berhasil menjadi bagian dari #Memory. 🌹</p>
            </div>
          </div>

          <div className={styles.recapBlock}>
            <h3>The Support Behind The Memory</h3>
            <div className={styles.recapText}>
              <p>Setiap kenangan yang berhasil tercipta tentu memiliki cerita di baliknya.</p>
              <p>Di sepanjang perjalanan Request Hour 2026, begitu banyak dukungan yang hadir dalam berbagai bentuk. Mulai dari donasi, pengumpulan vote, movement cashback, hingga bantuan dari teman-teman yang memilih untuk menjadi bagian dari perjalanan ini.</p>
              <p>Melalui dukungan tersebut, #Memory dapat terus berjalan hingga akhirnya menjadi cerita yang kita kenang bersama.</p>
              <p>Berikut adalah rangkuman dukungan yang berhasil dihimpun selama periode Request Hour 2026.</p>
            </div>
            <img 
              src="https://pbs.twimg.com/media/HN1B9D4bIAAlNm2?format=jpg&name=large" 
              alt="The Support Behind The Memory" 
              className={styles.recapImage}
            />
          </div>

          <div className={styles.recapBlock}>
            <h3>Vote Distribution</h3>
            <div className={styles.recapText}>
              <p>Setiap suara yang berhasil dihimpun selama periode Request Hour 2026 membawa harapan yang sama: melihat Erine dapat melangkah lebih jauh melalui lagu-lagu yang kita perjuangkan bersama.</p>
              <p>Dari berbagai bentuk dukungan yang berhasil terkumpul sepanjang perjalanan #Memory, seluruh vote kemudian dialokasikan ke lagu-lagu yang menjadi bagian dari strategi support selama Request Hour berlangsung.</p>
              <p>Berikut adalah distribusi vote yang berhasil dihimpun dan dialokasikan selama periode Request Hour 2026.</p>
            </div>
            <img 
              src="https://pbs.twimg.com/media/HNu7rxDawAAuTlf?format=jpg&name=medium" 
              alt="Vote Distribution" 
              className={styles.recapImage}
            />
          </div>

          <div className={styles.recapBlock}>
            <h3>Transparency Report</h3>
            <div className={styles.recapText}>
              <p>Sejak awal, #Memory dibangun di atas kepercayaan dan dukungan dari begitu banyak orang yang memilih untuk menjadi bagian dari perjalanan ini.</p>
              <p>Sebagai bentuk tanggung jawab atas kepercayaan tersebut, kami berkomitmen untuk menyampaikan laporan fund dan vote secara terbuka kepada seluruh pihak yang telah mendukung selama periode Request Hour 2026.</p>
              <p>Melalui laporan ini, kami berharap setiap teman-teman dapat melihat bagaimana dukungan yang berhasil dihimpun sepanjang perjalanan #Memory dikelola dan dialokasikan selama periode Request Hour berlangsung.</p>
              <p>Laporan lengkap dapat diakses melalui tautan berikut:</p>
              <div className={styles.reportLinkWrapper}>
                <a href="https://bit.ly/LapoRine_RH2026" target="_blank" rel="noopener noreferrer" className={styles.reportLink}>
                  <i className="bx bx-bar-chart-alt-2"></i> Laporan Fund dan Vote Request Hour 2026
                </a>
              </div>
            </div>
            <div className={styles.transparencyGrid}>
              <img src="https://pbs.twimg.com/media/HNu7FTXbUAAO_Zd?format=jpg&name=large" alt="Transparency 1" className={styles.gridImage}/>
              <img src="https://pbs.twimg.com/media/HNu7FTabMAAEzAA?format=jpg&name=large" alt="Transparency 2" className={styles.gridImage}/>
              <img src="https://pbs.twimg.com/media/HNu7FTha8AE3BQL?format=jpg&name=large" alt="Transparency 3" className={styles.gridImage}/>
              <img src="https://pbs.twimg.com/media/HNu7Fe3aAAAMYJa?format=jpg&name=large" alt="Transparency 4" className={styles.gridImage}/>
            </div>
          </div>

          <div className={styles.recapBlock}>
            <h3>The People Behind The Memory</h3>
            <div className={styles.recapText}>
              <p>Di balik setiap suara yang berhasil dihimpun, terdapat begitu banyak orang yang memilih untuk menjadi bagian dari perjalanan ini.</p>
              <p>Terima kasih kepada seluruh donatur, partisipan cashback, supporter, partner fanbase, serta teman-teman yang telah membantu menyebarkan informasi dan mendukung movement #Memory dengan caranya masing-masing.</p>
              <p>Terima kasih juga kepada seluruh pihak yang telah mempercayakan dukungannya kepada Cavallery selama periode Request Hour 2026 berlangsung.</p>
              <p>Setiap bantuan yang diberikan, sekecil apa pun bentuknya, telah menjadi bagian penting dari cerita yang berhasil kita ciptakan bersama.</p>
              <p>Karena pada akhirnya, #Memory tidak dibangun oleh satu orang.</p>
              <p>Ia tercipta dari begitu banyak langkah kecil yang dipilih untuk berjalan ke arah yang sama. 🌹</p>
            </div>
          </div>

          <div className={styles.recapBlock}>
            <h3>Until We Create Another Memory</h3>
            <div className={styles.recapText}>
              <p>Pada akhirnya, setiap perjalanan akan menemukan akhirnya sendiri.</p>
              <p>Panggung akan selesai. Lagu terakhir akan berhenti dimainkan. Angka-angka yang selama ini kita hitung perlahan akan kehilangan maknanya seiring berjalannya waktu.</p>
              <p>Namun tidak dengan cerita yang berhasil kita ciptakan bersama.</p>
              <p>Sebab yang membuat sebuah perjalanan layak untuk dikenang bukanlah seberapa jauh kita berhasil melangkah, melainkan siapa saja yang memilih untuk berjalan bersama hingga akhir.</p>
              <p>Dan jika ada satu hal yang dapat kita bawa pulang dari Request Hour 2026, mungkin itu adalah kenyataan bahwa begitu banyak orang yang pernah dipertemukan oleh harapan yang sama, lalu bersama-sama mengubahnya menjadi sebuah kenangan.</p>
              <p>Karena pada akhirnya, yang bertahan bukanlah hasil yang berhasil kita capai, melainkan cerita yang berhasil kita tinggalkan.</p>
              <p>Terima kasih untuk setiap suara yang diberikan. Untuk setiap dukungan yang dititipkan. Untuk setiap langkah yang ditempuh bersama sepanjang perjalanan #Memory.</p>
              <p>Apa yang telah kita perjuangkan mungkin telah mencapai garis akhirnya. Namun kenangan yang tercipta akan selalu menemukan caranya untuk hidup di dalam cerita yang kita bawa setelah ini.</p>
              <p>Sampai bertemu di perjalanan berikutnya.</p>
              <p className={styles.highlightText}>And until then, thank you for being part of #Memory.</p>
            </div>
          </div>

          <div className={styles.backBtnWrapper}>
            <Link href="/" className={styles.backBtn}>
              <i className="bx bx-left-arrow-alt" /> Kembali ke Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
