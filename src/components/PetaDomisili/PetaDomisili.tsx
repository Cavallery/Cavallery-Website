"use client";

import React, { useMemo, useState, useEffect } from "react";
import * as d3 from "d3";
import styles from "./PetaDomisili.module.css";
// Load the GeoJSON statically for instant, offline loading
import geoDataRaw from "@/data/indonesia-prov.json";

export interface RegionConfig {
  cities: string[];
  paths: string[];
}

export interface RegionMap {
  [region: string]: RegionConfig;
}

export interface CityData {
  [city: string]: number;
}

export interface LegendItem {
  label: string;
  range: [number, number];
  color: string;
}

export const rawData: CityData = {
  Jakarta: 92, Bekasi: 64, Tangerang: 58, Bogor: 52, Depok: 28,
  Bandung: 26, Surabaya: 24, Semarang: 20, Yogyakarta: 18, Malang: 17,
  Lampung: 12, Medan: 11, Padang: 9, Balikpapan: 8, Samarinda: 10,
  Pekalongan: 7, Banyumas: 6, Kediri: 7, Jember: 5, Sidoarjo: 7,
  Magelang: 5, Kebumen: 5, Kudus: 5, Palembang: 5, Makassar: 5,
  Bengkulu: 6, Denpasar: 2, Banjar: 2, Ponorogo: 3, Nganjuk: 2,
  Batam: 2, Solo: 3, Purwakarta: 2, Pontianak: 2, Pemalang: 3,
  Pasuruan: 2, Tasikmalaya: 2, Sragen: 2, Binjai: 2, Jambi: 2,
  Indramayu: 2, Tegal: 3, Purworejo: 2, Cilegon: 2, Sukabumi: 3,
  Blitar: 2, Boyolali: 2, Karawang: 3, Mojokerto: 2, "Pangkal Pinang": 2,
  Palu: 2, Kuningan: 3, Manado: 3, Probolinggo: 2, Tuban: 2,
  Kendari: 2, Wonosobo: 2, Garut: 2, Majalengka: 2, Lumajang: 2,
  Serang: 2, Pandeglang: 2, Lubuklinggau: 1,
};

export const regionMap: RegionMap = {
  Jabodetabek: {
    cities: ["Jakarta", "Bekasi", "Tangerang", "Bogor", "Depok"],
    paths: ["ID-JK", "ID-BT"],
  },
  "Jawa Barat": {
    cities: ["Bandung", "Cilegon", "Serang", "Karawang", "Sukabumi", "Purwakarta", "Tasikmalaya", "Indramayu", "Kuningan", "Garut", "Majalengka", "Pandeglang"],
    paths: ["ID-JB"],
  },
  "Jawa Tengah & DIY": {
    cities: ["Semarang", "Yogyakarta", "Pekalongan", "Banyumas", "Magelang", "Kebumen", "Kudus", "Solo", "Pemalang", "Sragen", "Purworejo", "Boyolali", "Wonosobo", "Tegal"],
    paths: ["ID-JT", "ID-YO"],
  },
  "Jawa Timur": {
    cities: ["Surabaya", "Malang", "Kediri", "Jember", "Sidoarjo", "Pasuruan", "Blitar", "Mojokerto", "Probolinggo", "Tuban", "Lumajang", "Ponorogo", "Nganjuk"],
    paths: ["ID-JI"],
  },
  "Bali & Nusa Tenggara": {
    cities: ["Denpasar"],
    paths: ["ID-BA", "ID-NB", "ID-NT"],
  },
  Sumatera: {
    cities: ["Lampung", "Medan", "Padang", "Palembang", "Bengkulu", "Batam", "Binjai", "Jambi", "Pangkal Pinang", "Lubuklinggau"],
    paths: ["ID-AC", "ID-SU", "ID-SB", "ID-RI", "ID-JA", "ID-BE", "ID-SS", "ID-LA", "ID-BB", "ID-KR"],
  },
  Kalimantan: {
    cities: ["Balikpapan", "Samarinda", "Pontianak", "Banjar"],
    paths: ["ID-KB", "ID-KT", "ID-KS", "ID-KI", "ID-KU"],
  },
  Sulawesi: {
    cities: ["Makassar", "Palu", "Manado", "Kendari"],
    paths: ["ID-GO", "ID-SA", "ID-ST", "ID-SR", "ID-SN", "ID-SG"],
  },
  "Maluku & Papua": {
    cities: [],
    paths: ["ID-MU", "ID-MA", "ID-PB", "ID-PA"],
  },
};

export const PALETTE: readonly string[] = [
  "var(--map-c1)",
  "var(--map-c2)",
  "var(--map-c3)",
  "var(--map-c4)",
  "var(--map-c5)",
  "var(--map-c6)",
  "var(--map-c7)",
  "var(--map-c8)",
  "var(--map-c9)",
] as const;

export const LEGEND_ITEMS = [
  { label: "Dominan", range: [200, Infinity] as [number, number], color: PALETTE[0] },
  { label: "Tinggi",  range: [50, 199]        as [number, number], color: PALETTE[2] },
  { label: "Sedang",  range: [10, 49]         as [number, number], color: PALETTE[4] },
  { label: "Rendah",  range: [1, 9]           as [number, number], color: PALETTE[6] },
];

// ISO mapping to GeoJSON 'Propinsi' names
const ISOMap: Record<string, string[]> = {
  "ID-JK": ["DKI JAKARTA"],
  "ID-BT": ["BANTEN"],
  "ID-JB": ["JAWA BARAT"],
  "ID-JT": ["JAWA TENGAH"],
  "ID-YO": ["DAERAH ISTIMEWA YOGYAKARTA"],
  "ID-JI": ["JAWA TIMUR"],
  "ID-BA": ["BALI"],
  "ID-NB": ["NUSATENGGARA BARAT"],
  "ID-NT": ["NUSATENGGARA TIMUR"],
  "ID-AC": ["DI. ACEH", "ACEH"],
  "ID-SU": ["SUMATERA UTARA"],
  "ID-SB": ["SUMATERA BARAT"],
  "ID-RI": ["RIAU"],
  "ID-JA": ["JAMBI"],
  "ID-BE": ["BENGKULU"],
  "ID-SS": ["SUMATERA SELATAN"],
  "ID-LA": ["LAMPUNG"],
  "ID-BB": ["BANGKA BELITUNG"],
  "ID-KR": ["KEPULAUAN RIAU"],
  "ID-KB": ["KALIMANTAN BARAT"],
  "ID-KT": ["KALIMANTAN TENGAH"],
  "ID-KS": ["KALIMANTAN SELATAN"],
  "ID-KI": ["KALIMANTAN TIMUR"],
  "ID-KU": ["KALIMANTAN UTARA"],
  "ID-GO": ["GORONTALO"],
  "ID-SA": ["SULAWESI UTARA"],
  "ID-ST": ["SULAWESI TENGAH"],
  "ID-SR": ["SULAWESI BARAT"],
  "ID-SN": ["SULAWESI SELATAN"],
  "ID-SG": ["SULAWESI TENGGARA"],
  "ID-MU": ["MALUKU UTARA"],
  "ID-MA": ["MALUKU"],
  "ID-PB": ["PAPUA BARAT"],
  "ID-PA": ["PAPUA"]
};

// Extract raw features from GeoJSON
const geoFeatures = (geoDataRaw as any).features || [];

export default function PetaDomisili() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const [cityData, setCityData] = useState<CityData>(rawData);

  useEffect(() => {
    fetch("/api/anggota-kota")
      .then(res => res.json())
      .then(json => {
        if (json?.success && json.data) {
          setCityData(json.data);
        }
      })
      .catch(console.error);
  }, []);

  // Compute Sums per Region
  const regionData = useMemo(() => {
    const sums: Record<string, number> = {};
    let total = 0;
    Object.keys(regionMap).forEach((r) => {
      const sum = regionMap[r].cities.reduce((s, c) => s + (cityData[c] || 0), 0);
      sums[r] = sum;
      total += sum;
    });

    const sortedRegions = Object.keys(regionMap)
      .filter((r) => sums[r] > 0)
      .sort((a, b) => sums[b] - sums[a]);

    return { sums, total, sortedRegions };
  }, [cityData]);

  const getRegionColor = (count: number) => {
    if (count === 0) return "";
    const item = LEGEND_ITEMS.find((l) => count >= l.range[0] && count <= l.range[1]);
    return item ? item.color : PALETTE[8];
  };

  // Map GeoJSON province string to region name via ISO code mapping
  const provinceToRegion = useMemo(() => {
    const mapping: Record<string, string> = {};
    Object.keys(regionMap).forEach((regionName) => {
      regionMap[regionName].paths.forEach((isoCode) => {
        const provNames = ISOMap[isoCode] || [];
        provNames.forEach(name => {
          mapping[name] = regionName;
        });
      });
    });
    return mapping;
  }, []);

  // Set up D3 Projection
  const pathGenerator = useMemo(() => {
    const projection = d3.geoIdentity()
      .reflectY(true)
      .fitSize([800, 360], geoDataRaw as any);
    return d3.geoPath().projection(projection);
  }, []);

  const handleMouseEnterMap = (e: React.MouseEvent, provinceName: string) => {
    const region = provinceToRegion[provinceName];
    if (region && regionData.sums[region] > 0) {
      setActiveRegion(region);
      setTooltip({
        show: true,
        text: `${region}: ${regionData.sums[region]} Anggota`,
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleMouseMoveMap = (e: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const handleMouseLeaveMap = () => {
    setActiveRegion(null);
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className={styles.container}>
      <div className={`glassCard ${styles.card}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2>Peta Sebaran Domisili</h2>
            <p>Visualisasi Anggota Cavallery per Wilayah</p>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{regionData.total}</span>
            <span className={styles.statLabel}>Total Anggota</span>
          </div>
        </div>

        <div className={styles.mapWrap}>
          {geoFeatures.length === 0 ? (
            <div className={styles.mapLoading}>Memuat Peta...</div>
          ) : (
            <svg viewBox="0 0 800 360" className={styles.svgMap}>
              {geoFeatures.map((feature: any, idx: number) => {
                const provName = feature.properties.Propinsi;
                const r = provinceToRegion[provName];
                const hasData = r && regionData.sums[r] > 0;
                const isActive = activeRegion === r;
                const fill = r ? getRegionColor(regionData.sums[r]) : "";

                return (
                  <path
                    key={idx}
                    d={pathGenerator(feature) || ""}
                    className={`${styles.province} ${hasData ? styles.provinceHasData : ""} ${isActive ? styles.provinceActive : ""}`}
                    style={fill && hasData ? { fill } : undefined}
                    onMouseEnter={(e) => handleMouseEnterMap(e, provName)}
                    onMouseMove={handleMouseMoveMap}
                    onMouseLeave={handleMouseLeaveMap}
                  />
                );
              })}
            </svg>
          )}
        </div>

        <div className={styles.grid}>
          {regionData.sortedRegions.map((region) => {
            const count = regionData.sums[region];
            const color = getRegionColor(count);
            const isActive = activeRegion === region;

            return (
              <div
                key={region}
                className={`${styles.box} ${isActive ? styles.boxActive : ""}`}
                style={{ borderLeftColor: color }}
                onMouseEnter={() => setActiveRegion(region)}
                onMouseLeave={() => setActiveRegion(null)}
              >
                <div className={styles.boxHeader}>
                  <div className={styles.boxName}>{region}</div>
                  <div className={styles.boxCount} style={{ color }}>{count}</div>
                </div>
                <div className={styles.tags}>
                  {regionMap[region].cities
                    .filter((c) => (cityData[c] || 0) > 0)
                    .map((city) => (
                      <span key={city} className={styles.tag}>
                        {city} <b>{cityData[city]}</b>
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={styles.tooltip}
        style={{
          opacity: tooltip.show ? 1 : 0,
          left: tooltip.x,
          top: tooltip.y - 20,
        }}
      >
        {tooltip.text}
      </div>
    </div>
  );
}
