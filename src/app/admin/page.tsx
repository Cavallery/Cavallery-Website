"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

const API_BASE = "https://v5.jkt48connect.com/api/cavallery";
const API_KEY = "JKTCONNECT";
const api = (path: string) => `${API_BASE}${path}?apikey=${API_KEY}`;

type Section = "dashboard" | "news" | "timeline" | "gallery" | "setlists" | "stats" | "youtube" | "funfacts" | "kabesha";

function sanitizeArrayField(val: any): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (val === null || val === undefined || val === "") return [];
  const s = String(val).trim();
  if (s === "") return [];
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
  }
  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1);
    const items: string[] = [];
    let current = ""; let inQuote = false;
    for (const ch of inner) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { items.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    if (current.trim()) items.push(current.trim());
    return items.filter(Boolean);
  }
  return s.split(",").map(v => v.trim()).filter(Boolean);
}

const ARRAY_FIELDS: Record<string, string[]> = {
  gallery:  ["tags"],
  news:     ["images"],
  setlists: ["songs"],
};

function preparePayload(section: string, data: Record<string, any>): Record<string, any> {
  const payload = { ...data };
  const arrayKeys = ARRAY_FIELDS[section] ?? [];
  for (const key of arrayKeys) {
    if (key in payload) payload[key] = sanitizeArrayField(payload[key]);
  }
  return payload;
}

// ─── PORTAL WRAPPER — bypass website navbar/layout ────────────
// Renders children into a fixed full-screen overlay via useEffect
import { useRef } from "react";
import { createPortal } from "react-dom";

function AdminPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Hide website header/navbar while admin is open
    const siteHeader = document.querySelector("header") as HTMLElement | null;
    const siteNav    = document.querySelector("nav")    as HTMLElement | null;
    if (siteHeader) siteHeader.style.display = "none";
    if (siteNav)    siteNav.style.display    = "none";
    document.body.style.overflow = "hidden";
    setMounted(true);
    return () => {
      if (siteHeader) siteHeader.style.display = "";
      if (siteNav)    siteNav.style.display    = "";
      document.body.style.overflow = "";
    };
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── LOGIN ────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      if (user === "Vallencia" && pass === "3R!N3") {
        sessionStorage.setItem("cava_admin", "1");
        onLogin();
      } else {
        setErr("Username atau password salah.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <AdminPortal>
      <div className={styles.adminRoot}>
        <div className={styles.loginWrap}>
          <div className={styles.loginCard}>
            <div className={styles.loginLogo}><i className="bx bxs-shield-alt-2" /></div>
            <h1 className={styles.loginTitle}>Cavallery Admin</h1>
            <p className={styles.loginSub}>Masuk untuk mengelola konten</p>
            {err && <div className={styles.errMsg}><i className="bx bx-error-circle" /> {err}</div>}
            <div className={styles.field}>
              <label>Username</label>
              <input value={user} onChange={e => setUser(e.target.value)} placeholder="Username" autoComplete="username" />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
                autoComplete="current-password" onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <button className={styles.loginBtn} onClick={submit} disabled={loading}>
              {loading ? <><i className="bx bx-loader-alt bx-spin" /> Masuk...</> : "Masuk"}
            </button>
          </div>
        </div>
      </div>
    </AdminPortal>
  );
}

// ─── TOAST ────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <i className={`bx ${type === "success" ? "bx-check-circle" : "bx-error-circle"}`} />
      {msg}
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
        <i className="bx bx-trash" style={{ fontSize: "2.5rem", color: "var(--adm-danger)" }} />
        <p>{msg}</p>
        <div className={styles.confirmBtns}>
          <button className={styles.btnGhost} onClick={onCancel}>Batal</button>
          <button className={styles.btnDanger} onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── GENERIC TABLE ────────────────────────────────────────────
function DataTable({ cols, rows, onEdit, onDelete }: {
  cols: { key: string; label: string }[];
  rows: any[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}<th>Aksi</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length + 1} className={styles.empty}><i className="bx bx-inbox" /> Tidak ada data</td></tr>
          ) : rows.map((row, i) => (
            <tr key={row.id ?? row.stat_key ?? i}>
              {cols.map(c => (
                <td key={c.key}>{
                  typeof row[c.key] === "boolean" ? (row[c.key] ? "✓" : "✗") :
                  c.key === "image_url" && row[c.key] ? <img src={row[c.key]} alt="" className={styles.thumb} /> :
                  Array.isArray(row[c.key]) ? row[c.key].join(", ").slice(0, 60) :
                  String(row[c.key] ?? "-").slice(0, 60)
                }</td>
              ))}
              <td>
                <div className={styles.actionBtns}>
                  <button className={styles.btnEdit} onClick={() => onEdit(row)}><i className="bx bx-edit" /></button>
                  <button className={styles.btnDel}  onClick={() => onDelete(row)}><i className="bx bx-trash" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MODAL FORM ───────────────────────────────────────────────
function FormModal({ title, fields, data, onChange, onSave, onClose, saving }: {
  title: string;
  fields: { key: string; label: string; type?: string; rows?: number; hint?: string }[];
  data: Record<string, any>;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const displayValue = (key: string, val: any): string => {
    if (Array.isArray(val)) return val.join(", ");
    return String(val ?? "");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={e => e.stopPropagation()}>
        <div className={styles.formModalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeX} onClick={onClose}><i className="bx bx-x" /></button>
        </div>
        <div className={styles.formBody}>
          {fields.map(f => (
            <div key={f.key} className={styles.field}>
              <label>
                {f.label}
                {f.hint && <span className={styles.fieldHint}> — {f.hint}</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea rows={f.rows ?? 4} value={displayValue(f.key, data[f.key])}
                  onChange={e => onChange(f.key, e.target.value)} />
              ) : f.type === "checkbox" ? (
                <label className={styles.toggle}>
                  <input type="checkbox" checked={!!data[f.key]}
                    onChange={e => onChange(f.key, e.target.checked)} />
                  <span>{data[f.key] ? "Aktif" : "Nonaktif"}</span>
                </label>
              ) : (
                <input type={f.type ?? "text"} value={displayValue(f.key, data[f.key])}
                  onChange={e => onChange(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div className={styles.formFooter}>
          <button className={styles.btnGhost} onClick={onClose}>Batal</button>
          <button className={styles.btnPrimary} onClick={onSave} disabled={saving}>
            {saving ? <><i className="bx bx-loader-alt bx-spin" /> Menyimpan...</> : <><i className="bx bx-save" /> Simpan</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION MANAGER ──────────────────────────────────────────
function SectionManager({ section }: { section: Section }) {
  const [rows, setRows]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState<"add" | "edit" | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<any>(null);
  const [toast, setToast]   = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const cfg: Record<string, {
    endpoint: string;
    cols: { key: string; label: string }[];
    fields: { key: string; label: string; type?: string; rows?: number; hint?: string }[];
    listKey: string;
  }> = {
    news: {
      endpoint: "/news", listKey: "news",
      cols: [
        { key: "image_url", label: "Gambar" }, { key: "title", label: "Judul" },
        { key: "label", label: "Label" }, { key: "is_active", label: "Aktif" },
        { key: "published_at", label: "Tanggal" },
      ],
      fields: [
        { key: "slug", label: "Slug" }, { key: "title", label: "Judul" },
        { key: "label", label: "Label" },
        { key: "description", label: "Deskripsi Singkat", type: "textarea", rows: 2 },
        { key: "content", label: "Konten Lengkap", type: "textarea", rows: 6 },
        { key: "image_url", label: "URL Gambar Utama" },
        { key: "images", label: "URL Gambar Dokumentasi", hint: "pisahkan dengan koma", type: "textarea", rows: 2 },
        { key: "link_url", label: "Link URL" },
        { key: "published_at", label: "Tanggal Publish", type: "datetime-local" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
        { key: "is_pinned", label: "Pin", type: "checkbox" },
      ],
    },
    timeline: {
      endpoint: "/timeline", listKey: "events",
      cols: [
        { key: "year", label: "Tahun" }, { key: "date_label", label: "Tanggal" },
        { key: "title", label: "Judul" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "year", label: "Tahun" }, { key: "event_date", label: "Tanggal Event", type: "date" },
        { key: "date_label", label: "Label Tanggal" }, { key: "title", label: "Judul" },
        { key: "description", label: "Deskripsi", type: "textarea", rows: 3 },
        { key: "image_url", label: "URL Gambar" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    gallery: {
      endpoint: "/gallery", listKey: "items",
      cols: [
        { key: "image_url", label: "Gambar" }, { key: "title", label: "Judul" },
        { key: "date_label", label: "Tanggal" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "title", label: "Judul" }, { key: "image_url", label: "URL Gambar" },
        { key: "date_label", label: "Label Tanggal" }, { key: "alt_text", label: "Alt Text" },
        { key: "tags", label: "Tags", hint: "pisahkan dengan koma, boleh kosong" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    setlists: {
      endpoint: "/setlists", listKey: "",
      cols: [
        { key: "image_url", label: "Gambar" }, { key: "title", label: "Judul" },
        { key: "date_range", label: "Periode" }, { key: "badge", label: "Badge" },
        { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "title", label: "Judul" },
        { key: "date_range", label: "Periode (cth: 1 Jan - Present)" },
        { key: "badge", label: "Badge (cth: 3 Shows)" },
        { key: "image_url", label: "URL Gambar" },
        { key: "songs", label: "Songs", hint: "pisahkan dengan koma", type: "textarea", rows: 3 },
        { key: "show_count", label: "Jumlah Show", type: "number" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    stats: {
      endpoint: "/stats", listKey: "",
      cols: [
        { key: "stat_key", label: "Key" }, { key: "label", label: "Label" },
        { key: "value", label: "Nilai" }, { key: "icon", label: "Icon" },
        { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "stat_key", label: "Stat Key (cth: total_shows)" },
        { key: "label", label: "Label" }, { key: "value", label: "Nilai", type: "number" },
        { key: "icon", label: "Icon (cth: bx-calendar)" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    youtube: {
      endpoint: "/youtube", listKey: "videos",
      cols: [
        { key: "title", label: "Judul" }, { key: "category", label: "Kategori" },
        { key: "video_id", label: "Video ID" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "title", label: "Judul" }, { key: "url", label: "URL YouTube" },
        { key: "category", label: "Kategori" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    funfacts: {
      endpoint: "/funfacts", listKey: "",
      cols: [
        { key: "content", label: "Konten" }, { key: "sort_order", label: "Urutan" },
        { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "content", label: "Konten Funfact", type: "textarea", rows: 3 },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    kabesha: {
      endpoint: "/kabesha", listKey: "",
      cols: [
        { key: "image_url", label: "Gambar" }, { key: "year_label", label: "Tahun" },
        { key: "title", label: "Judul" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "year_label", label: "Label Tahun" }, { key: "title", label: "Judul" },
        { key: "description", label: "Deskripsi", type: "textarea", rows: 3 },
        { key: "image_url", label: "URL Gambar" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active", label: "Aktif", type: "checkbox" },
      ],
    },
    dashboard: { endpoint: "", listKey: "", cols: [], fields: [] },
  };

  const c = cfg[section];

  const load = useCallback(async () => {
    if (section === "dashboard") return;
    setLoading(true);
    try {
      const res  = await fetch(api(c.endpoint));
      const json = await res.json();
      const data = json?.data;
      if      (Array.isArray(data))              setRows(data);
      else if (data?.news)                       setRows(data.news);
      else if (data?.items)                      setRows(data.items);
      else if (data?.videos)                     setRows(data.videos);
      else if (data?.events)                     setRows(data.events);
      else if (c.listKey && data?.[c.listKey])   setRows(data[c.listKey]);
      else                                       setRows([]);
    } catch { setRows([]); }
    setLoading(false);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setFormData({ is_active: true, sort_order: 0 }); setModal("add"); };
  const openEdit = (row: any) => { setFormData({ ...row }); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    try {
      const isEdit = modal === "edit";
      const editId = section === "stats"   ? formData.stat_key
                   : section === "youtube" ? formData.video_id
                   : formData.id;
      const url    = isEdit ? api(`${c.endpoint}/${editId}`) : api(c.endpoint);
      const payload = preparePayload(section, formData);
      const res  = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.status) { showToast(isEdit ? "Berhasil diperbarui!" : "Berhasil ditambahkan!", "success"); setModal(null); load(); }
      else               showToast(json.message || "Gagal menyimpan", "error");
    } catch { showToast("Terjadi kesalahan jaringan", "error"); }
    setSaving(false);
  };

  const del = async (row: any) => {
    setConfirm(null);
    try {
      const id  = section === "stats"   ? row.stat_key
                : section === "youtube" ? row.video_id
                : row.id;
      const res  = await fetch(api(`${c.endpoint}/${id}`), { method: "DELETE" });
      const json = await res.json();
      if (json.status) { showToast("Berhasil dihapus!", "success"); load(); }
      else               showToast(json.message || "Gagal menghapus", "error");
    } catch { showToast("Terjadi kesalahan jaringan", "error"); }
  };

  if (section === "dashboard") return null;

  return (
    <div className={styles.sectionWrap}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmModal
          msg={`Hapus "${confirm.title || confirm.label || confirm.stat_key || confirm.content?.slice(0, 40) || "item ini"}"?`}
          onConfirm={() => del(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {modal && (
        <FormModal
          title={modal === "add" ? `Tambah ${section}` : `Edit ${section}`}
          fields={c.fields} data={formData}
          onChange={(k, v) => setFormData(prev => ({ ...prev, [k]: v }))}
          onSave={save} onClose={() => setModal(null)} saving={saving}
        />
      )}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-data" /> {section.charAt(0).toUpperCase() + section.slice(1)}
          <span className={styles.count}>{rows.length} item</span>
        </h2>
        <button className={styles.btnPrimary} onClick={openAdd}><i className="bx bx-plus" /> Tambah</button>
      </div>
      {loading
        ? <div className={styles.loadingState}><i className="bx bx-loader-alt bx-spin" /> Memuat data...</div>
        : <DataTable cols={c.cols} rows={rows} onEdit={openEdit} onDelete={row => setConfirm(row)} />
      }
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────
function DashboardHome({ onNav }: { onNav: (s: Section) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    ([
      { key: "news",     path: "/news"     },
      { key: "timeline", path: "/timeline" },
      { key: "gallery",  path: "/gallery"  },
      { key: "setlists", path: "/setlists" },
      { key: "youtube",  path: "/youtube"  },
      { key: "funfacts", path: "/funfacts" },
      { key: "kabesha",  path: "/kabesha"  },
      { key: "stats",    path: "/stats"    },
    ] as { key: string; path: string }[]).forEach(async ({ key, path }) => {
      try {
        const res  = await fetch(api(path));
        const json = await res.json();
        const data = json?.data;
        let count = 0;
        if      (Array.isArray(data))            count = data.length;
        else if (data?.total !== undefined)      count = data.total;
        else if (data?.news)                     count = data.news.length;
        else if (data?.items)                    count = data.items.length;
        else if (data?.videos)                   count = data.videos.length;
        else if (data?.events)                   count = data.events.length;
        setCounts(prev => ({ ...prev, [key]: count }));
      } catch {}
    });
  }, []);

  const cards = [
    { key: "news"      as Section, icon: "bx-news",      label: "News",     color: "#b45309" },
    { key: "timeline"  as Section, icon: "bx-history",   label: "Timeline", color: "#047857" },
    { key: "gallery"   as Section, icon: "bx-image-alt", label: "Gallery",  color: "#7c3aed" },
    { key: "setlists"  as Section, icon: "bx-music",     label: "Setlists", color: "#0369a1" },
    { key: "youtube"   as Section, icon: "bxl-youtube",  label: "YouTube",  color: "#dc2626" },
    { key: "funfacts"  as Section, icon: "bx-laugh",     label: "Funfacts", color: "#059669" },
    { key: "kabesha"   as Section, icon: "bx-star",      label: "Kabesha",  color: "#d97706" },
    { key: "stats"     as Section, icon: "bx-bar-chart", label: "Stats",    color: "#9333ea" },
  ];

  return (
    <div className={styles.dashHome}>
      <div className={styles.welcomeBanner}>
        <div>
          <h2>Selamat datang, Vallencia!</h2>
          <p>Kelola konten Cavallery dari sini.</p>
        </div>
        <i className="bx bxs-shield-alt-2" style={{ fontSize: "4rem", opacity: 0.15 }} />
      </div>
      <div className={styles.dashGrid}>
        {cards.map(card => (
          <button key={card.key} className={styles.dashCard} onClick={() => onNav(card.key)}
            style={{ "--accent": card.color } as any}>
            <i className={`bx ${card.icon}`} style={{ color: card.color }} />
            <div className={styles.dashCardCount}>{counts[card.key] ?? "—"}</div>
            <div className={styles.dashCardLabel}>{card.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────
const navItems: { key: Section; icon: string; label: string }[] = [
  { key: "dashboard", icon: "bx-home-alt",  label: "Dashboard" },
  { key: "news",      icon: "bx-news",      label: "News"      },
  { key: "timeline",  icon: "bx-history",   label: "Timeline"  },
  { key: "gallery",   icon: "bx-image-alt", label: "Gallery"   },
  { key: "setlists",  icon: "bx-music",     label: "Setlists"  },
  { key: "youtube",   icon: "bxl-youtube",  label: "YouTube"   },
  { key: "funfacts",  icon: "bx-laugh",     label: "Funfacts"  },
  { key: "kabesha",   icon: "bx-star",      label: "Kabesha"   },
  { key: "stats",     icon: "bx-bar-chart", label: "Stats"     },
];

// ─── MAIN ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [active,   setActive]   = useState<Section>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("cava_admin") === "1") setAuthed(true);
    setChecking(false);
  }, []);

  const logout = () => { sessionStorage.removeItem("cava_admin"); setAuthed(false); };

  if (checking) return (
    <div className={styles.fullCenter}>
      <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem" }} />
    </div>
  );

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  const navigate = (section: Section) => { setActive(section); setDrawerOpen(false); };

  return (
    <AdminPortal>
      {/* ── scoped CSS vars so admin styles don't conflict with site theme ── */}
      <style>{`
        .adm-root {
          --adm-bg:      #1a1a1a;
          --adm-surface: #242424;
          --adm-border:  #333;
          --adm-text:    #f0f0f0;
          --adm-muted:   #999;
          --adm-accent:  #c9a84c;
          --adm-danger:  #e05252;
          --adm-sidebar: 220px;
          --adm-topbar:  52px;
        }
      `}</style>

      <div className={`${styles.adminRoot} adm-root`}>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideTop}>
            <div className={styles.sideLogo}>
              <i className="bx bxs-shield-alt-2" />
              <span>Cavallery</span>
            </div>
            <nav className={styles.nav}>
              {navItems.map(n => (
                <button key={n.key}
                  className={`${styles.navItem} ${active === n.key ? styles.navActive : ""}`}
                  onClick={() => navigate(n.key)}>
                  <i className={`bx ${n.icon}`} />
                  <span>{n.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <i className="bx bx-log-out" /> Keluar
          </button>
        </aside>

        {/* ── MOBILE DRAWER OVERLAY ── */}
        {drawerOpen && (
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
            <aside className={styles.drawer} onClick={e => e.stopPropagation()}>
              <div className={styles.sideTop}>
                <div className={styles.sideLogo}>
                  <i className="bx bxs-shield-alt-2" />
                  <span>Cavallery</span>
                </div>
                <nav className={styles.nav}>
                  {navItems.map(n => (
                    <button key={n.key}
                      className={`${styles.navItem} ${active === n.key ? styles.navActive : ""}`}
                      onClick={() => navigate(n.key)}>
                      <i className={`bx ${n.icon}`} />
                      <span>{n.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
              <button className={styles.logoutBtn} onClick={logout}>
                <i className="bx bx-log-out" /> Keluar
              </button>
            </aside>
          </div>
        )}

        {/* ── MAIN AREA ── */}
        <div className={styles.mainArea}>

          {/* topbar */}
          <header className={styles.topbar}>
            {/* hamburger — mobile only */}
            <button className={styles.menuBtn} onClick={() => setDrawerOpen(true)}>
              <i className="bx bx-menu" />
            </button>
            <div className={styles.topbarTitle}>
              {navItems.find(n => n.key === active)?.label ?? "Dashboard"}
            </div>
            <div className={styles.topbarRight}>
              <span className={styles.adminBadge}><i className="bx bx-user" /> Admin</span>
              {/* logout shortcut on mobile */}
              <button className={styles.logoutIconBtn} onClick={logout} title="Keluar">
                <i className="bx bx-log-out" />
              </button>
            </div>
          </header>

          {/* content */}
          <div className={styles.content}>
            {active === "dashboard"
              ? <DashboardHome onNav={setActive} />
              : <SectionManager section={active} />
            }
          </div>
        </div>
      </div>
    </AdminPortal>
  );
}
