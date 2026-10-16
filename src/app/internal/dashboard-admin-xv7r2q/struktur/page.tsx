"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSubNav from "@/components/admin/AdminSubNav";
import styles from "./page.module.css";

type Tingkat = 1 | 2 | 3 | 4;

interface Pengurus {
  id: number;
  nama: string;
  jabatan: string;
  divisi: string;
  tingkat: Tingkat;
  urutan: number;
  fotoUrl: string | null;
  sosial: string | null;
  aktif: boolean;
}

const TINGKAT: { value: Tingkat; label: string; hint: string }[] = [
  { value: 1, label: "Pimpinan", hint: "Ketua, Wakil Ketua" },
  { value: 2, label: "Pengurus Inti", hint: "Sekretaris, Bendahara, dll." },
  { value: 3, label: "Koordinator Divisi", hint: "Kepala/koordinator tiap divisi" },
  { value: 4, label: "Anggota Divisi", hint: "Anggota di dalam divisi" },
];

const DIVISI_SARAN = [
  "Inti",
  "Divisi Humas",
  "Divisi Desain",
  "Divisi IT",
  "Divisi Medsos",
  "Divisi Esports",
  "Divisi Sekretaris",
  "Divisi Video Editor",
  "Bendahara",
];

const API = "/api/admin/struktur";

const EMPTY = {
  nama: "",
  jabatan: "",
  divisi: "Inti",
  tingkat: 4 as Tingkat,
  urutan: 0,
  fotoUrl: "",
  sosial: "",
  aktif: true,
};

type FormState = typeof EMPTY;

export default function AdminStrukturPage() {
  const router = useRouter();
  const [list, setList] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(
    () =>
      fetch(API, { cache: "no-store" })
        .then(async (res) => {
          if (res.status === 401) {
            router.replace("/internal/dashboard-admin-xv7r2q");
            return;
          }
          const json = await res.json();
          if (json.status) setList(json.data || []);
          else setMsg({ ok: false, text: json.message || "Gagal memuat data" });
        })
        .catch(() => setMsg({ ok: false, text: "Gagal terhubung ke server" }))
        .finally(() => setLoading(false)),
    [router]
  );

  useEffect(() => {
    load();
  }, [load]);

  const divisiOptions = useMemo(
    () => Array.from(new Set([...DIVISI_SARAN, ...list.map((p) => p.divisi)])).sort(),
    [list]
  );

  const grouped = useMemo(
    () => TINGKAT.map((t) => ({ ...t, items: list.filter((p) => p.tingkat === t.value) })),
    [list]
  );

  const openCreate = (tingkat: Tingkat = 4) => {
    setEditingId(null);
    setForm({ ...EMPTY, tingkat, divisi: tingkat <= 2 ? "Inti" : "" });
    setFormOpen(true);
    setMsg(null);
  };

  const openEdit = (p: Pengurus) => {
    setEditingId(p.id);
    setForm({
      nama: p.nama,
      jabatan: p.jabatan,
      divisi: p.divisi,
      tingkat: p.tingkat,
      urutan: p.urutan,
      fotoUrl: p.fotoUrl || "",
      sosial: p.sosial || "",
      aktif: p.aktif,
    });
    setFormOpen(true);
    setMsg(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      const json = await res.json();
      setMsg({ ok: Boolean(json.status), text: json.message || (json.status ? "Tersimpan" : "Gagal menyimpan") });
      if (json.status) {
        setFormOpen(false);
        await load();
      }
    } catch {
      setMsg({ ok: false, text: "Gagal terhubung ke server" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Pengurus) => {
    if (!confirm(`Hapus ${p.nama} (${p.jabatan}) dari struktur?`)) return;
    setMsg(null);
    try {
      const res = await fetch(`${API}?id=${p.id}`, { method: "DELETE" });
      const json = await res.json();
      setMsg({ ok: Boolean(json.status), text: json.message || "Selesai" });
      if (json.status) await load();
    } catch {
      setMsg({ ok: false, text: "Gagal terhubung ke server" });
    }
  };

  const toggleAktif = async (p: Pengurus) => {
    try {
      const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, aktif: !p.aktif }),
      });
      const json = await res.json();
      if (json.status) await load();
      else setMsg({ ok: false, text: json.message || "Gagal mengubah status" });
    } catch {
      setMsg({ ok: false, text: "Gagal terhubung ke server" });
    }
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AdminSubNav
          activeKey="struktur"
          title="Struktur Admin Cavallery"
          subtitle="Kelola bagan kepengurusan yang tampil di halaman Tentang Cavallery — tanpa Canva."
        />

        <div className={styles.toolbar}>
          <p className={styles.summary}>
            <strong>{list.filter((p) => p.aktif).length}</strong> pengurus aktif · {list.length} total
          </p>
          <div className={styles.toolbarActions}>
            <a href="/about/cavallery" target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
              <i className="bx bx-show" /> Lihat di Website
            </a>
            <button type="button" className={styles.btnPrimary} onClick={() => openCreate()}>
              <i className="bx bx-plus" /> Tambah Pengurus
            </button>
          </div>
        </div>

        {msg && (
          <div className={styles.msg} data-ok={msg.ok ? "true" : "false"} role="status">
            <i className={`bx ${msg.ok ? "bx-check-circle" : "bx-error-circle"}`} /> {msg.text}
          </div>
        )}

        {loading ? (
          <div className={styles.empty}>Memuat data struktur…</div>
        ) : (
          <div className={styles.tiers}>
            {grouped.map((g) => (
              <section key={g.value} className={styles.tier}>
                <header className={styles.tierHead}>
                  <div>
                    <h2>{g.label}</h2>
                    <span>{g.hint}</span>
                  </div>
                  <button type="button" className={styles.btnSmall} onClick={() => openCreate(g.value)}>
                    <i className="bx bx-plus" /> Tambah
                  </button>
                </header>

                {g.items.length === 0 ? (
                  <p className={styles.tierEmpty}>Belum ada pengurus di tingkat ini.</p>
                ) : (
                  <ul className={styles.rows}>
                    {g.items.map((p) => (
                      <li key={p.id} className={styles.row} data-aktif={p.aktif ? "true" : "false"}>
                        <span className={styles.avatar} aria-hidden="true">
                          {p.fotoUrl ? <img src={p.fotoUrl} alt="" /> : p.nama.slice(0, 1).toUpperCase()}
                        </span>
                        <span className={styles.rowText}>
                          <strong>{p.nama}</strong>
                          <span>
                            {p.jabatan} · {p.divisi}
                            {p.sosial ? ` · @${p.sosial}` : ""}
                          </span>
                        </span>
                        <span className={styles.order} title="Urutan tampil">
                          #{p.urutan}
                        </span>
                        <button
                          type="button"
                          className={styles.status}
                          data-aktif={p.aktif ? "true" : "false"}
                          onClick={() => toggleAktif(p)}
                          title="Klik untuk mengubah status tampil"
                        >
                          {p.aktif ? "Tampil" : "Disembunyikan"}
                        </button>
                        <button type="button" className={styles.iconBtn} onClick={() => openEdit(p)} aria-label={`Edit ${p.nama}`}>
                          <i className="bx bx-edit-alt" />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => remove(p)}
                          aria-label={`Hapus ${p.nama}`}
                        >
                          <i className="bx bx-trash" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="struktur-form-title" onClick={() => setFormOpen(false)}>
          <form className={styles.modal} onSubmit={submit} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHead}>
              <h2 id="struktur-form-title">{editingId ? "Edit Pengurus" : "Tambah Pengurus"}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setFormOpen(false)} aria-label="Tutup">
                <i className="bx bx-x" />
              </button>
            </header>

            <div className={styles.fields}>
              <label className={styles.field}>
                <span>Nama *</span>
                <input value={form.nama} onChange={(e) => set("nama", e.target.value)} maxLength={120} required autoFocus />
              </label>
              <label className={styles.field}>
                <span>Jabatan *</span>
                <input
                  value={form.jabatan}
                  onChange={(e) => set("jabatan", e.target.value)}
                  maxLength={120}
                  placeholder="mis. Ketua, Koordinator Desain, Anggota"
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Tingkat</span>
                <select value={form.tingkat} onChange={(e) => set("tingkat", Number(e.target.value) as Tingkat)}>
                  {TINGKAT.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Divisi</span>
                <input
                  value={form.divisi}
                  onChange={(e) => set("divisi", e.target.value)}
                  list="struktur-divisi"
                  maxLength={120}
                  placeholder="mis. Divisi Desain"
                />
                <datalist id="struktur-divisi">
                  {divisiOptions.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </label>
              <label className={styles.field}>
                <span>Urutan tampil</span>
                <input type="number" value={form.urutan} onChange={(e) => set("urutan", Number(e.target.value) || 0)} />
              </label>
              <label className={styles.field}>
                <span>Username sosmed (opsional)</span>
                <input value={form.sosial} onChange={(e) => set("sosial", e.target.value)} maxLength={120} placeholder="@username" />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>URL foto (opsional)</span>
                <input
                  value={form.fotoUrl}
                  onChange={(e) => set("fotoUrl", e.target.value)}
                  maxLength={500}
                  placeholder="https://… atau /images/…"
                />
              </label>
              <label className={`${styles.check} ${styles.full}`}>
                <input type="checkbox" checked={form.aktif} onChange={(e) => set("aktif", e.target.checked)} />
                <span>Tampilkan di website</span>
              </label>
            </div>

            <footer className={styles.modalFoot}>
              <button type="button" className={styles.btnGhost} onClick={() => setFormOpen(false)}>
                Batal
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Tambah"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
