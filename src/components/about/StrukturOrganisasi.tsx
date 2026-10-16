"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type ReactNode } from "react";
import KnightSvg from "@/components/chess/KnightSvg";
import styles from "./StrukturOrganisasi.module.css";

interface Pengurus {
  id: number;
  nama: string;
  jabatan: string;
  divisi: string;
  tingkat: 1 | 2 | 3 | 4;
  urutan: number;
  fotoUrl: string | null;
  sosial: string | null;
}

const initials = (nama: string) =>
  nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function Avatar({ p, size }: { p: Pengurus; size: "lg" | "md" | "sm" }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={styles.avatar} data-size={size} aria-hidden="true">
      {p.fotoUrl && !broken ? (
        <img src={p.fotoUrl} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
      ) : (
        <span className={styles.initials}>{initials(p.nama) || <KnightSvg size={20} />}</span>
      )}
    </span>
  );
}

function PersonCard({ p, size }: { p: Pengurus; size: "lg" | "md" }) {
  return (
    <article className={styles.card} data-size={size}>
      <Avatar p={p} size={size} />
      <div className={styles.cardText}>
        <span className={styles.role}>{p.jabatan}</span>
        <strong className={styles.name}>{p.nama}</strong>
        {p.sosial && <span className={styles.handle}>@{p.sosial}</span>}
      </div>
    </article>
  );
}

/**
 * Bagan struktur pengurus Cavallery — dirender dari data (dikelola lewat
 * Dashboard Admin › Struktur Admin). Selama data masih kosong, `fallback`
 * (embed lama) yang ditampilkan.
 */
export default function StrukturOrganisasi({ fallback }: { fallback?: ReactNode }) {
  const [data, setData] = useState<Pengurus[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/struktur")
      .then((r) => r.json())
      .then((j) => alive && setData(Array.isArray(j?.data) ? j.data : []))
      .catch(() => alive && setData([]));
    return () => {
      alive = false;
    };
  }, []);

  if (data === null) {
    return <div className={styles.loading} aria-busy="true">Memuat struktur kepengurusan…</div>;
  }
  if (data.length === 0) return <>{fallback ?? null}</>;

  const pimpinan = data.filter((p) => p.tingkat === 1);
  const inti = data.filter((p) => p.tingkat === 2);
  const divisiMap = new Map<string, { koor: Pengurus[]; anggota: Pengurus[] }>();
  data
    .filter((p) => p.tingkat >= 3)
    .forEach((p) => {
      const g = divisiMap.get(p.divisi) || { koor: [], anggota: [] };
      (p.tingkat === 3 ? g.koor : g.anggota).push(p);
      divisiMap.set(p.divisi, g);
    });
  const divisi = [...divisiMap.entries()];

  return (
    <div className={styles.chart}>
      {pimpinan.length > 0 && (
        <div className={styles.tier} data-tier="1">
          <span className={styles.tierLabel}>Pimpinan</span>
          <div className={styles.row}>
            {pimpinan.map((p) => (
              <PersonCard key={p.id} p={p} size="lg" />
            ))}
          </div>
        </div>
      )}

      {inti.length > 0 && (
        <div className={styles.tier} data-tier="2">
          <span className={styles.tierLabel}>Pengurus Inti</span>
          <div className={styles.row}>
            {inti.map((p) => (
              <PersonCard key={p.id} p={p} size="md" />
            ))}
          </div>
        </div>
      )}

      {divisi.length > 0 && (
        <div className={styles.tier} data-tier="3">
          <span className={styles.tierLabel}>Divisi</span>
          <div className={styles.divisions}>
            {divisi.map(([nama, g]) => (
              <section key={nama} className={styles.division}>
                <header className={styles.divisionHead}>
                  <KnightSvg size={16} />
                  <h3>{nama}</h3>
                  <span>{g.koor.length + g.anggota.length} orang</span>
                </header>
                {g.koor.map((p) => (
                  <PersonCard key={p.id} p={p} size="md" />
                ))}
                {g.anggota.length > 0 && (
                  <ul className={styles.members}>
                    {g.anggota.map((p) => (
                      <li key={p.id}>
                        <Avatar p={p} size="sm" />
                        <span className={styles.memberText}>
                          <strong>{p.nama}</strong>
                          <span>{p.jabatan}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
