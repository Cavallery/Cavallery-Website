"use client";
import styles from "./TimelineSection.module.css";

interface TimelineEvent {
  year: string;
  date: string;
  title: string;
  desc: string;
  image?: string;
}

const timelineEvents: TimelineEvent[] = [
  { year: "2023", date: "18 November 2023", title: "Introduction to JKT48 Trainee Erine", desc: "Erine resmi diperkenalkan sebagai anggota Trainee JKT48 generasi ke-12 pada acara Jakarta Japan Matsuri.", image: "" },
  { year: "2024", date: "1 Maret 2024", title: "Erine's First Time on Aitakatta Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist Aitakatta pada 1 Maret 2024.", image: "" },
  { year: "2024", date: "5 Mei 2024", title: "Erine's First Time Doing Off-Air Activities", desc: "Erine tampil untuk pertama kalinya dalam pertunjukan Off Air pada acara Narayafest di Kota Tegal.", image: "" },
  { year: "2024", date: "11 Mei 2024", title: "Meet & Erine's First Greeting", desc: "Erine mengikuti sesi Meet & Greet ke-1 dalam acara 'Spring Has Come'.", image: "" },
  { year: "2024", date: "31 Mei 2024", title: "Erine's First Time on Pajama Drive's Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist Pajama Drive pada 31 Mei 2024.", image: "" },
  { year: "2024", date: "20 Agustus 2024", title: "Erine's First JKT48 MV: 'Belalang yang Membangkang'", desc: "Erine untuk pertama kalinya tampil dalam video musik (MV) JKT48 berjudul Belalang yang Membangkang.", image: "" },
  { year: "2024", date: "21 Agustus 2024", title: "Erine 17 Years Old", desc: "Erine merayakan ulang tahunnya yang ke-17 pada 21 Agustus 2024.", image: "" },
  { year: "2024", date: "28 September 2024", title: "Erine's Second Meet & Greet", desc: "Erine mengikuti sesi Meet & Greet ke-2 dalam acara Road to Sousenkyo.", image: "" },
  { year: "2024", date: "10 Oktober 2024", title: "Erine's First Time Being Included in Renai Kinshi Jourei's Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist Renai Kinshi Jourei pada 10 Oktober 2024.", image: "" },
  { year: "2024", date: "15 Desember 2024", title: "18th Rank of JKT48 Sousenkyo 2024", desc: "Erine meraih peringkat ke-18 dalam Sousenkyo JKT48 2024.", image: "" },
  { year: "2025", date: "11 Februari 2025", title: "Erine's Third Meet & Greet", desc: "Erine mengikuti sesi Meet & Greet ke-3 dalam acara 'Sukinanda'.", image: "" },
  { year: "2025", date: "20 Februari 2025", title: "Erine's Second JKT48 MV: 'Bibir yang Telah Dicuri'", desc: "Erine untuk kedua kalinya tampil dalam video musik (MV) JKT48 berjudul Bibir yang Telah Dicuri.", image: "" },
  { year: "2025", date: "24 Mei 2025", title: "Erine's First Time Being Included in Te wo Tsunaginagara Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist Te wo Tsunaginagara pada 24 Mei 2025.", image: "" },
  { year: "2025", date: "21 Agustus 2025", title: "Erine 18 Years Old", desc: "Erine merayakan ulang tahunnya yang ke-18 pada 21 Agustus 2025.", image: "" },
  { year: "2025", date: "25 Oktober 2025", title: "12th Generation Promotion", desc: "Erine diumumkan mendapat promosi menjadi member inti JKT48.", image: "" },
  { year: "2025", date: "21 November 2025", title: "Erine's First Time on Kira Kira Girls' Trainee Special Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist spesial trainee Kira Kira Girls.", image: "" },
  { year: "2026", date: "17 Januari 2026", title: "Erine's First Time Being Included in Ramune no Namikata Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist Cara Meminum Ramune pada 17 Januari 2026.", image: "" },
  { year: "2026", date: "11 April 2026", title: "Erine's First Time Being Included in Passion 200% Setlist", desc: "Erine melakukan penampilan teaternya dengan setlist Passion 200% pada 11 April 2026.", image: "" },
  { year: "2026", date: "23 Mei 2026", title: "Erine's Fourth Meet & Greet", desc: "Erine mengikuti sesi Meet & Greet ke-4 dalam acara 'Love Dream Passion'.", image: "" },
];

// Group events by year
function groupByYear(events: TimelineEvent[]) {
  const groups: { year: string; events: TimelineEvent[] }[] = [];
  let current: { year: string; events: TimelineEvent[] } | null = null;
  for (const ev of events) {
    if (!current || current.year !== ev.year) {
      current = { year: ev.year, events: [ev] };
      groups.push(current);
    } else {
      current.events.push(ev);
    }
  }
  return groups;
}

export default function TimelineSection() {
  const yearGroups = groupByYear(timelineEvents);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="badge"><i className="bx bx-history" /> Journey</div>
          <h2 className="sectionTitle">Timeline <span className="textGold">Erine</span></h2>
        </div>

        {yearGroups.map((group) => (
          <div key={group.year} className={styles.yearSection}>
            <div className={styles.yearHeader}>
              <span className={styles.yearBadge}>{group.year}</span>
              <div className={styles.yearLine} />
            </div>

            <div className={styles.timeline}>
              {group.events.map((event, idx) => (
                <div key={idx} className={styles.item}>
                  <div className={styles.dot} />
                  <div className={styles.content}>
                    <div className={styles.cardInner}>
                      <div className={styles.imgPlaceholder}>
                        {event.image ? (
                          <img src={event.image} alt={event.title} />
                        ) : (
                          <div className={styles.noImg}>
                            <i className="bx bx-image" />
                          </div>
                        )}
                      </div>
                      <div className={styles.textSide}>
                        <div className={styles.date}>{event.date}</div>
                        <h3 className={styles.title}>{event.title}</h3>
                        <p className={styles.desc}>{event.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
