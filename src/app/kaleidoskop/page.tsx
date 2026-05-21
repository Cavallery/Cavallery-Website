"use client";
import React, { useEffect, useRef } from "react";
import "./style.css";

const htmlContent = `
    <div class="cava-timeline">
      <div class="star-layer layer1"></div>
      <div class="star-layer layer2"></div>
      <div class="star-layer layer3"></div>

      <div class="bg-sky">
        <span class="bg-shooting-star bs1"></span>
        <span class="bg-shooting-star bs2"></span>
        <span class="bg-shooting-star bs3"></span>
      </div>

      <div class="timeline-shell">
        <div class="timeline-inner">
          <header class="hero-k">
            <div class="hero-sky-k">
              <span class="shooting-star s1"></span>
              <span class="shooting-star s2"></span>
              <span class="shooting-star s3"></span>
            </div>

            <div class="hero-brand">
              <span class="icon">✦</span>
              <span>Kaleidoskop Cavallery bersama Erine</span>
              <span class="icon">✦</span>
            </div>
            <h1 class="hero-title-k">JEJAK TAHUN KEDUA</h1>
          </header>

          <section class="intro-card">
            <div class="intro-card-title">Our Second Chapter</div>
            <p>
              Tahun kedua berjalan seperti sebuah cerita yang tumbuh
              perlahan—tenang, sabar, tapi penuh makna di tiap halamannya.
            </p>
            <p>
              Ada hari yang terasa berat, ada langkah yang sempat goyah, dan ada
              momen yang menuntut kita untuk menata ulang arah. Namun di setiap
              lika-liku itu, Cavallery tetap menemukan caranya untuk berdiri
              kembali—karena ada hati yang tetap tinggal, dan tangan yang tetap
              saling menggenggam.
            </p>
            <p>
              Dari warna yang kalian hadirkan, dari dukungan yang tak pernah
              putus, dan dari cahaya yang Erine bawa di setiap panggungnya,
              perjalanan ini terus bergerak maju.
            </p>
            <p>
              Di sepanjang tahun kedua ini, setiap langkah menorehkan cerita
              yang berbeda. Ada momen yang menenangkan, ada yang penuh warna,
              dan ada yang menguatkan perjalanan kita sebagai komunitas.
            </p>
            <p>
              Berikut adalah jejak-jejak itu—fragmen kecil yang, ketika
              dirangkai, membentuk satu tahun penuh makna bagi Cavallery.
            </p>
          </section>

          <div class="section-block">
            <h2 class="section-heading">
              Off-Air Journey — Jejak Panggung di Luar Theater
            </h2>
            <p class="section-note">
              Tahun kedua Cavallery juga berjalan melalui panggung-panggung di
              luar teater—tempat di mana Erine memperluas langkahnya, dan
              Cavallery memilih untuk hadir di beberapa di antaranya. Berikut
              adalah off-air Erine yang disertai kehadiran Cavallery, lengkap
              dengan langkah keberapa di perjalanan panggungnya.
            </p>
          </div>

          <section class="timeline">
            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">30 November 2024</div>
                    <h3 class="card-title">
                      Off-air #8 — LapakGaming Battle Arena
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Off-air ke-8
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Off-air pertama Erine setelah satu tahun perjalanan di
                    JKT48. Di Balai Kartini, Cavallery hadir kembali—mengiringi
                    langkah barunya dengan kehangatan yang familiar.
                  </p>
                  <div class="card-media">
                    <video controls preload="metadata">
                      <source
                        src="https://cavallery.id/wp-content/uploads/2025/11/offair-lapak.mp4"
                        type="video/mp4"
                      />
                      Browser kamu tidak mendukung pemutar video.
                    </video>
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">06 Desember 2024</div>
                    <h3 class="card-title">
                      Off-air #9 — Indonesia Game Festival
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Off-air ke-9
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Di IGF, ICE BSD Hall 3A, Erine tampil di panggung off-air
                    kesembilannya. Momen ini bertepatan dengan hari
                    Jumat—<strong>#DiesVenErine</strong>—yang membuat kehadiran
                    Cavallery terasa semakin istimewa dan penuh keceriaan.
                  </p>
                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/Indonesia-Game-Festival.webp"
                      alt="Off-air #16 — Bung’s Market"
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">29 Juni 2025</div>
                    <h3 class="card-title">Off-air #16 — Bung’s Market</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Off-air ke-16
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Pada off-air ke-16, Cavallery datang ramai-ramai ke Bung’s
                    Market, meski cuaca diguyur hujan. Tetapi justru di bawah
                    rintik itu, hangatnya kebersamaan terasa paling
                    jelas—menghadirkan cerita kecil bahwa dukungan bisa hidup di
                    mana saja, bahkan di tengah cuaca yang tak bersahabat.
                  </p>
                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/Bungs-Market-1.webp"
                      alt="Off-air #16 — Bung’s Market"
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">19 Juli 2025</div>
                    <h3 class="card-title">
                      Off-air #19 — The Big Bounce Indonesia
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Off-air ke-19
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Di langkah off-air ke-19, Cavallery ikut meramaikan keseruan
                    Big Bounce Indonesia di PIK Community Park. Acara penuh
                    energi ini menjadi warna cerah dalam perjalanan tahun
                    kedua—ringan, riuh, dan penuh tawa.
                  </p>
                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/offair-bigbounce.webp"
                      alt="Off-air #19 — The Big Bounce Indonesia"
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">24 Agustus 2025</div>
                    <h3 class="card-title">
                      Off-air #21 — BlaBlaBla Fest Palembang
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Off-air ke-21
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Off-air ke-21 menjadi momen spesial—datang hanya tiga hari
                    setelah Erine merayakan ulang tahunnya yang ke-18 pada 21
                    Agustus. Cavallery ikut hadir di Palembang, membuktikan
                    bahwa dukungan bisa melangkah sejauh apa pun Erine berada,
                    bahkan di awal perjalanannya yang baru.
                  </p>
                  <div class="card-media-grid">
                    <figure>
                      <img
                        src="https://cavallery.id/wp-content/uploads/2025/11/offair-blabla.webp"
                        alt="Off-air #21 — BlaBlaBla Fest Palembang 1"
                      />
                    </figure>
                    <figure>
                      <img
                        src="https://cavallery.id/wp-content/uploads/2025/11/offair-blabla2.jpg"
                        alt="Off-air #21 — BlaBlaBla Fest Palembang 2"
                      />
                    </figure>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div class="section-block">
            <h2 class="section-heading">
              Event JKT48 — Di Antara Riuh Panggung JKT48
            </h2>
            <p class="section-note">
              Di luar teater dan off-air, tahun kedua Cavallery juga berjalan di
              tengah panggung-panggung besar JKT48. Dalam gemerlap lampu
              panggung, Erine hadir dengan kejutan-kejutan yang membuat setiap
              penonton terpikat—membawa ciri khasnya yang ceria, percaya diri,
              dan penuh daya tarik. Cavallery pun ikut hadir di antara keramaian
              itu, menyaksikan bagaimana setiap langkahnya semakin mantap dan
              semakin memikat.
            </p>
          </div>

          <section class="timeline">
            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">15 Desember 2024</div>
                    <h3 class="card-title">
                      WONDERLAND — JKT48 13th Anniversary Concert & Sousenkyo
                      Announcement
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Konser & Sousenkyo
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Di konser ulang tahun JKT48 yang ke-13, Cavallery hadir
                    menyaksikan Erine berdiri di salah satu panggung terbesar
                    tahun itu. <em>Wonderland</em> tidak hanya menghadirkan
                    cerita megah dan penuh imajinasi, tetapi juga menjadi malam
                    penting ketika pengumuman Sousenkyo disampaikan.
                  </p>
                  <p>
                    Di penghujung acara, kerja keras dan dukungan yang telah
                    dikumpulkan bersama berbuah hasil yang luar biasa: Erine
                    berhasil meraih posisi ke-18 dengan total
                    <strong>37.957 suara</strong>.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/05/pasukan-berkuda-6.jpg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">8 Februari 2025</div>
                    <h3 class="card-title">
                      Personal Meet & Greet: JKT48 26th Single
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Personal MnG
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Di festival MnG ini, Cavallery kembali dipertemukan dengan
                    Erine dalam ruang yang lebih dekat dan hangat. Untuk pertama
                    kalinya, Erine membawakan
                    <strong>“Bibir Yang Telah Dicuri”</strong> secara langsung.
                  </p>
                  <p>
                    Interaksi singkat hari itu menyimpan cerita kecil yang akan
                    selalu dikenang.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/06/GjRwwUua0AAUTX6.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">26 Juli 2025</div>
                    <h3 class="card-title">
                      JKT48 Special Concert FULL HOUSE
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Konser Spesial
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Pada konser penuh energi ini, Erine mendapatkan momen spesial
                    sebagai backdancer yang menemani Kak Feni Fitriyanti dalam
                    membawakan <strong>Dear J!</strong>
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/07/pasukan-berkuda.jpg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">25 Oktober 2025</div>
                    <h3 class="card-title">
                      MnG & 2-Shot — SISTER REUNION
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>MnG & 2-Shot
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Dalam suasana penuh kebersamaan, Erine dan anggota generasi
                    12 lainnya menerima pengumuman penting: mereka akan resmi
                    menjadi member inti pada Januari 2025 mendatang.
                  </p>
                  <p>
                    Cavallery hadir menyaksikan langkah besar ini—sebuah bab
                    baru yang menandai perjalanan Erine menuju jenjang berikutnya
                    di JKT48.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/sister-reunion.jpeg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div class="section-block">
            <h2 class="section-heading">
              Kegiatan Cavallery — Hari-Hari Bersama Cavallery
            </h2>
            <p class="section-note">
              Di antara panggung-panggung besar, Cavallery juga tumbuh melalui
              hari-hari kecil—pertemuan sederhana, kegiatan spontan, dan momen
              hangat yang membentuk fondasi komunitas ini.
            </p>
          </div>

          <section class="timeline">
            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card expanded">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">18 Januari 2025</div>
                    <h3 class="card-title">MINSOC GEN 12</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Funmatch Fanbase
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Minsoc Gen 12 menjadi kegiatan pembuka tahun—funmatch antar
                    fanbase yang penuh energi dan keakraban.
                  </p>
                  <p>
                    Cavallery hadir berbagi tawa, bermain bersama, dan
                    mempererat silaturahmi dengan fanbase lain.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/minsoc4.webp"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">15 Februari 2025</div>
                    <h3 class="card-title">Cavallery vs Olinever</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Fun Match
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Cavallery dan Olinever berkumpul dengan semangat penuh
                    energi—yell kompak, suasana kompetitif tetapi hangat.
                  </p>
                  <p>
                    Tawa dan foto bersama membuat Fun Match ini menjadi kenangan
                    manis.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/bugarine2.webp"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">21 Februari 2025</div>
                    <h3 class="card-title">
                      Nobar MV UG — “Bibir yang Telah Dicuri”
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Nobar MV
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    Nobar MV mempertemukan banyak fanbase di suasana hangat.
                  </p>
                  <p>
                    Kebersamaan sederhana ini menjadi salah satu highlight manis
                    tahun kedua.
                  </p>

                  <div class="card-media-grid">
                    <figure>
                      <img
                        src="https://cavallery.id/wp-content/uploads/2025/11/ErineUG.webp"
                        alt=""
                      />
                    </figure>
                    <figure>
                      <img
                        src="https://cavallery.id/wp-content/uploads/2025/11/ErineUGD.webp"
                        alt=""
                      />
                    </figure>
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">23 Maret 2025</div>
                    <h3 class="card-title">#BukbeRine</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Ramadan & Kebersamaan
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>#BukbeRine menjadi momen hangat di bulan Ramadan.</p>
                  <p>
                    Dari makan bareng hingga canda ringan, suasana sederhana ini
                    mempererat hubungan antar anggota.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/05/pasukan-berkuda-7.jpg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">1 Juni 2025</div>
                    <h3 class="card-title">Badminton #BugaRine</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Olahraga & Tawa
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>Kegiatan olahraga ringan penuh tawa dan kebersamaan.</p>
                  <p>
                    #BugaRine menjadi momen sederhana namun penuh kehangatan.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/Bugarine.webp"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>

            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">3 Juni 2025</div>
                    <h3 class="card-title">#Mabarine Roblox</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>Online & Komunitas
                    </div>
                  </div>
                  <div class="card-toggle"><span>▼</span></div>
                </div>

                <div class="card-body">
                  <p>
                    #Mabarine Roblox menghadirkan keseruan bersama fans dan
                    followers.
                  </p>
                  <p>
                    Dari ekspedisi Antartika hingga balapan riuh penuh canda,
                    momen ini menunjukkan bahwa kebersamaan tumbuh bahkan dari
                    game virtual.
                  </p>

                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/mabar_roblox.webp"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div class="section-block">
            <h2 class="section-heading">
              Perayaan Ulang Tahun ke-18 — #ErineInEtherland
            </h2>
            <p class="section-note">
              Usia ke-18 menjadi salah satu titik penting dalam perjalanan
              Erine—bab baru yang penuh harapan, kedewasaan, dan langkah yang
              semakin mantap. Perayaan ini berlangsung dalam rangkaian momen
              online dan offline yang saling menyambung, menjadikan Etherland
              sebagai ruang di mana cahaya barunya disambut bersama.
            </p>
          </div>

          <section class="timeline">
            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">Agustus 2025</div>
                    <h3 class="card-title">Bab Baru yang Penuh Cahaya</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Ulang Tahun ke-18
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Usia ke-18 menjadi salah satu titik penting dalam perjalanan
                    Erine: bab baru yang penuh harapan, kedewasaan, dan langkah
                    yang semakin mantap.
                  </p>
                  <p>
                    Cavallery merayakan momen ini dengan penuh kehangatan,
                    menghadirkan ucapan, kejutan kecil, hingga perayaan bersama
                    untuk menyambut usia barunya. Setiap detail bukan sekadar
                    perayaan ulang tahun, tetapi wujud rasa sayang dan dukungan
                    yang tumbuh dari waktu ke waktu.
                  </p>
                  <p>
                    Inilah momen ketika Cavallery kembali menyampaikan harapan
                    terbaik untuk perjalanan Erine — memasuki dunia yang lebih
                    luas dengan hati yang semakin kuat.
                  </p>

                  <div class="sub-timeline">
                    <div class="sub-item sub-expanded">
                      <div class="sub-header">
                        <div class="sub-left">
                          <div class="sub-date">Menjelang 21 Agustus</div>
                          <div class="sub-title">
                            Sub-bagian 1 — Perayaan Online: “Erine In Etherland”
                          </div>
                        </div>
                        <div class="sub-toggle"><span>▼</span></div>
                      </div>
                      <div class="sub-body">
                        <p>
                          Pada seminggu menjelang ulang tahunnya yang ke-18,
                          Cavallery merilis rangkaian countdown bertema
                          <strong>Etherland</strong> — sebuah dunia tenang yang
                          menggambarkan perjalanan batin Erine menuju cahaya
                          pilihannya.
                        </p>
                        <p>
                          Setiap hari, satu bagian cerita diungkapkan: catatan
                          baru yang muncul di cermin, simbol-simbol kecil yang
                          berubah, dan pesan-pesan yang menandai perkembangan
                          perasaannya. Setiap detail menjadi fragmen dari
                          perjalanan Erine dalam mengenali dirinya dan memilih
                          untuk tetap kuat.
                        </p>
                        <p>
                          Countdown ini bukan sekadar hitung mundur, tetapi
                          kisah kecil yang dipublikasikan harian, membangun
                          suasana yang semakin hangat menjelang tanggal 21.
                        </p>
                        <div class="card-media">
                          <img
                            src="https://cavallery.id/wp-content/uploads/2025/09/erine18-1-e1759550995827.jpg"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>

                    <div class="sub-item">
                      <div class="sub-header">
                        <div class="sub-left">
                          <div class="sub-date">21 Agustus 2025</div>
                          <div class="sub-title">
                            Sub-bagian 2 — Perayaan Offline: Videotron Ulang
                            Tahun ke-18
                          </div>
                        </div>
                        <div class="sub-toggle"><span>▼</span></div>
                      </div>
                      <div class="sub-body">
                        <p>
                          Pada 21 Agustus, Etherland muncul di tengah kota.
                          Melalui videotron besar di Ratu Plaza, dunia yang
                          selama seminggu hadir dalam cerita countdown kini
                          bersinar di dunia nyata — hadir untuk siapa pun yang
                          melihatnya.
                        </p>
                        <p>
                          Awan lembut dan cahaya ungu memenuhi layar, membawa
                          tema <strong>“Erine In Etherland”</strong>. Di momen
                          ini, dukungan Cavallery bukan hanya cerita dalam
                          postingan, tapi cahaya yang benar-benar menyala di
                          Jakarta.
                        </p>
                        <p>
                          Pendukung berkumpul pada sesi foto bersama, menjadikan
                          perayaan ini tidak hanya simbolis, tetapi juga hangat
                          dan nyata — jejak kasih yang menyambut usia baru
                          Erine.
                        </p>
                        <div class="card-media">
                          <img
                            src="https://cavallery.id/wp-content/uploads/2025/11/Videotron.webp"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>

                    <div class="sub-item">
                      <div class="sub-header">
                        <div class="sub-left">
                          <div class="sub-date">Penutupan Etherland</div>
                          <div class="sub-title">
                            Sub-bagian 3 — Penutupan Etherland &amp; Perayaan
                            Bersama Cavallery
                          </div>
                        </div>
                        <div class="sub-toggle"><span>▼</span></div>
                      </div>
                      <div class="sub-body">
                        <p>
                          Dalam cerita Etherland, lilin kecil itu menjadi awal
                          cahaya. Dan ketika Cavallery berkumpul untuk merayakan
                          ulang tahun ke-18 Erine, cahaya itu tumbuh menjadi
                          hangatnya kebersamaan.
                        </p>
                        <p>
                          Di depan project offline, Cavallery berkumpul,
                          berfoto, dan merayakan penutup Etherland bersama —
                          sebuah simbol bahwa perjalanan batin yang diceritakan
                          selama seminggu kini menemukan wujudnya di dunia
                          nyata.
                        </p>
                        <p>
                          Malam itu, Etherland resmi ditutup, namun cahaya yang
                          lahir dari kebersamaan tetap tinggal.
                        </p>
                        <div class="card-media">
                          <img
                            src="https://cavallery.id/wp-content/uploads/2025/09/sts-2.jpg"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div class="section-block">
            <h2 class="section-heading">Langkah yang Menjadi Tonggak</h2>
            <p class="section-note">
              Jejak momen penting yang menandai perjalanan Erine di tahun kedua
              — terutama saat langkahnya berpindah ke setlist baru dan membuka
              bab berbeda.
            </p>
          </div>

          <section class="timeline">
            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">24 Mei 2025</div>
                    <h3 class="card-title">
                      Shonichi Te wo Tsunaginagara — Empat Angin, Satu Langkah
                    </h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Show ke-61
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Pada 24 Mei 2025, sebuah langkah penting tercatat dalam
                    perjalanan Erine: debutnya di setlist
                    <em
                      >Sambil Menggenggam Erat Tanganku — Te wo
                      Tsunaginagara</em
                    >. Bagi Erine, ini adalah show ke-61 dalam kariernya — dan
                    justru dari langkah ke-61 inilah, pintu menuju bab baru
                    terbuka.
                  </p>
                  <p>
                    Shonichi ini bukan hanya tentang tampil pertama kali di
                    setlist baru, tetapi tentang momen ketika keberanian, usaha,
                    dan dukungan bertemu di satu panggung.
                  </p>
                  <p>
                    Melalui kolaborasi Cavallery, Nalania, Regilios, dan Grovy,
                    lahirlah project
                    <strong>“Empat Angin, Satu Langkah”</strong> — simbol bahwa
                    empat dukungan berbeda dapat bertiup ke arah yang sama,
                    mengiringi debut empat member generasi 12 di setlist yang
                    baru.
                  </p>
                  <p>
                    Dari display bunga, freebies, hingga momen foto bersama,
                    semuanya dirangkai sebagai bentuk apresiasi. Cavallery
                    menjadi salah satu angin itu — setia berhembus, siap menjaga
                    langkah Erine di awal chapter barunya.
                  </p>
                  <div class="card-media">
                    <img
                      src="https://cavallery.id/wp-content/uploads/2025/11/Erine_TWT.webp"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </article>
          </section>

          <h2 class="section-heading">
            Penutup — Menutup Halaman, Menyambut Cahaya Baru
          </h2>

          <section class="timeline">
            <article class="timeline-item">
              <div class="timeline-marker"><span></span></div>
              <div class="timeline-card expanded closing-card">
                <div class="card-header">
                  <div class="card-left">
                    <div class="card-date">Dua Tahun Cavallery</div>
                    <h3 class="card-title">Dua Tahun, Banyak Cahaya</h3>
                    <div class="card-tag">
                      <span class="tag-dot"></span>
                      Penutup
                    </div>
                  </div>
                  <div class="card-toggle" aria-label="Toggle detail">
                    <span>▼</span>
                  </div>
                </div>
                <div class="card-body">
                  <p>
                    Dua tahun bukan waktu yang singkat, tapi juga bukan akhir
                    dari perjalanan. Hari ini, kita merayakan Cavallery yang
                    tetap berdiri, dan Erine yang terus bersinar di setiap
                    langkahnya. Dari setiap warna yang hadir, setiap dukungan
                    yang tak pernah padam, dan setiap cerita yang kita rangkai
                    bersama — perjalanan ini hidup karena kita memilih untuk
                    tetap berada di sini.
                  </p>
                  <p>
                    Selamat dua tahun untuk kita. Selamat dua tahun untuk Erine.
                    Mari membawa cahaya ini ke tahun berikutnya — lebih kuat,
                    lebih hangat, dan lebih hidup dari sebelumnya.
                  </p>
                  <p>— Sampai jumpa di chapter berikutnya.</p>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
      
      <button class="scroll-top" aria-label="Kembali ke atas">
        <span>↑</span>
      </button>
    </div>
`;

export default function KaleidoskopPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Toggle card logic
    const cards = container.querySelectorAll(".timeline-card");
    cards.forEach((card) => {
      const btn = card.querySelector(".card-toggle");
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          card.classList.toggle("expanded");
        });
      }
    });

    // Toggle sub-items
    const subHeaders = container.querySelectorAll(".sub-header");
    subHeaders.forEach((header) => {
      header.addEventListener("click", (e) => {
        e.stopPropagation();
        const subItem = header.closest(".sub-item");
        if (subItem) subItem.classList.toggle("sub-expanded");
      });
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const timelineItems = container.querySelectorAll(".timeline-item");
    timelineItems.forEach((item) => observer.observe(item));

    // Scroll to top button logic
    const scrollTopBtn = container.querySelector(".scroll-top");
    const handleScroll = () => {
      if (window.scrollY > 260) {
        scrollTopBtn?.classList.add("visible");
      } else {
        scrollTopBtn?.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", handleScroll);
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
