"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./page.module.css";

const API_BASE    = "https://v5.jkt48connect.com/api/cavallery";
const API_KEY     = "JKTCONNECT";
const api = (path: string) => `${API_BASE}${path}?apikey=${API_KEY}`;

const DISCORD_API   = "/api/discord";  // relative, no token needed di frontend
const DISCORD_TOKEN = "";              // token dipindah ke backend

type Section =
  | "dashboard" | "news"     | "timeline" | "gallery"
  | "setlists"  | "stats"    | "youtube"  | "funfacts"
  | "kabesha"   | "media"    | "discord";

// ─── HELPERS ─────────────────────────────────────────────────
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

// ─── ADMIN PORTAL ─────────────────────────────────────────────
function AdminPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
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
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
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

// ─── MEDIA UPLOAD MODAL ───────────────────────────────────────
function MediaUploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (url: string) => void;
}) {
  const [files, setFiles]         = useState<File[]>([]);
  const [folder, setFolder]       = useState("cavallery/images");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files));
  };

  const upload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress([]);

    if (files.length === 1) {
      const fd = new FormData();
      fd.append("file", files[0]);
      fd.append("folder", folder);
      fd.append("alt_text", files[0].name);
      try {
        const res  = await fetch(api("/media/upload"), { method: "POST", body: fd });
        const json = await res.json();
        if (json.status) {
          setProgress([`✓ ${files[0].name} — berhasil`]);
          onUploaded(json.data.public_url);
        } else {
          setProgress([`✗ ${files[0].name} — ${json.message}`]);
        }
      } catch {
        setProgress([`✗ ${files[0].name} — error jaringan`]);
      }
    } else {
      const fd = new FormData();
      files.forEach(f => fd.append("files[]", f));
      fd.append("folder", folder);
      try {
        const res  = await fetch(api("/media/upload-multiple"), { method: "POST", body: fd });
        const json = await res.json();
        const logs: string[] = [];
        (json.data?.uploaded ?? []).forEach((u: any) => logs.push(`✓ ${u.original_name}`));
        (json.data?.errors   ?? []).forEach((e: any) => logs.push(`✗ ${e.name} — ${e.reason}`));
        setProgress(logs);
        if (json.data?.uploaded?.length > 0) onUploaded(json.data.uploaded[0].public_url);
      } catch {
        setProgress(["✗ Error jaringan"]);
      }
    }
    setUploading(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.formModal} style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className={styles.formModalHeader}>
          <h3><i className="bx bx-upload" /> Upload Media</h3>
          <button className={styles.closeX} onClick={onClose}><i className="bx bx-x" /></button>
        </div>
        <div className={styles.formBody}>
          <div
            className={styles.dropZone}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <i className="bx bx-cloud-upload" style={{ fontSize: "2.5rem", opacity: 0.5 }} />
            <p>Drag & drop atau <u>klik untuk pilih file</u></p>
            <small>JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV · Maks 10MB gambar / 200MB video</small>
            <input
              ref={inputRef} type="file" multiple style={{ display: "none" }}
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={handleFiles}
            />
          </div>

          {files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((f, i) => (
                <div key={i} className={styles.fileItem}>
                  <i className={`bx ${f.type.startsWith("video") ? "bx-video" : "bx-image"}`} />
                  <span>{f.name}</span>
                  <small>{(f.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              ))}
            </div>
          )}

          <div className={styles.field}>
            <label>Folder</label>
            <select
              value={folder}
              onChange={e => setFolder(e.target.value)}
              style={{
                background: "var(--adm-surface)", color: "var(--adm-text)",
                border: "1px solid var(--adm-border)", borderRadius: 6, padding: "8px 12px",
              }}
            >
              <option value="cavallery/images">cavallery/images</option>
              <option value="cavallery/videos">cavallery/videos</option>
              <option value="gallery">gallery</option>
              <option value="news">news</option>
            </select>
          </div>

          {progress.length > 0 && (
            <div className={styles.progressLog}>
              {progress.map((p, i) => (
                <div key={i} className={p.startsWith("✓") ? styles.logOk : styles.logErr}>{p}</div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.formFooter}>
          <button className={styles.btnGhost} onClick={onClose}>Tutup</button>
          <button className={styles.btnPrimary} onClick={upload} disabled={uploading || files.length === 0}>
            {uploading
              ? <><i className="bx bx-loader-alt bx-spin" /> Mengupload...</>
              : <><i className="bx bx-upload" /> Upload {files.length > 0 ? `(${files.length})` : ""}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MEDIA PICKER MODAL ───────────────────────────────────────
function MediaPickerModal({
  onPick,
  onClose,
  type = "image",
}: {
  onPick: (url: string) => void;
  onClose: () => void;
  type?: "image" | "video" | "all";
}) {
  const [items, setItems]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [folder, setFolder]         = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (folder) params.set("folder", folder);
      if (type !== "all") params.set("type", type);
      params.set("limit", "100");
      const res  = await fetch(`${api("/media")}&${params}`);
      const json = await res.json();
      setItems(json?.data?.items ?? []);
    } catch { setItems([]); }
    setLoading(false);
  }, [search, folder, type]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.formModal}
          style={{ maxWidth: 760, width: "95vw" }}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.formModalHeader}>
            <h3><i className="bx bx-folder-open" /> Pilih Media</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={styles.btnPrimary}
                style={{ fontSize: 13 }}
                onClick={() => setShowUpload(true)}
              >
                <i className="bx bx-upload" /> Upload Baru
              </button>
              <button className={styles.closeX} onClick={onClose}><i className="bx bx-x" /></button>
            </div>
          </div>
          <div className={styles.formBody}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input
                placeholder="Cari nama file..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, minWidth: 160,
                  background: "var(--adm-surface)", color: "var(--adm-text)",
                  border: "1px solid var(--adm-border)", borderRadius: 6, padding: "7px 12px",
                }}
              />
              <select
                value={folder}
                onChange={e => setFolder(e.target.value)}
                style={{
                  background: "var(--adm-surface)", color: "var(--adm-text)",
                  border: "1px solid var(--adm-border)", borderRadius: 6, padding: "7px 12px",
                }}
              >
                <option value="">Semua Folder</option>
                <option value="cavallery/images">cavallery/images</option>
                <option value="cavallery/videos">cavallery/videos</option>
                <option value="gallery">gallery</option>
                <option value="news">news</option>
              </select>
              <button className={styles.btnGhost} onClick={load}>
                <i className="bx bx-refresh" />
              </button>
            </div>

            {loading ? (
              <div className={styles.loadingState}><i className="bx bx-loader-alt bx-spin" /> Memuat...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", opacity: 0.4 }}>
                <i className="bx bx-image-alt" style={{ fontSize: "2.5rem" }} />
                <p>Belum ada media</p>
              </div>
            ) : (
              <div className={styles.mediaGrid}>
                {items.map(item => (
                  <div
                    key={item.id}
                    className={styles.mediaThumbWrap}
                    onClick={() => { onPick(item.public_url); onClose(); }}
                  >
                    {item.type === "video" ? (
                      <div className={styles.videoThumb}>
                        <i className="bx bx-video-recording" />
                        <small>{item.original_name.slice(0, 20)}</small>
                      </div>
                    ) : (
                      <img
                        src={item.public_url}
                        alt={item.alt_text || item.original_name}
                        className={styles.mediaThumbImg}
                        loading="lazy"
                      />
                    )}
                    <div className={styles.mediaThumbLabel}>{item.original_name.slice(0, 22)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.formFooter}>
            <button className={styles.btnGhost} onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>

      {showUpload && (
        <MediaUploadModal
          onClose={() => { setShowUpload(false); load(); }}
          onUploaded={() => { setShowUpload(false); load(); }}
        />
      )}
    </>
  );
}

// ─── FORM MODAL ───────────────────────────────────────────────
function FormModal({
  title, fields, data, onChange, onSave, onClose, saving,
}: {
  title: string;
  fields: { key: string; label: string; type?: string; rows?: number; hint?: string }[];
  data: Record<string, any>;
  onChange: (key: string, val: any) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [pickerField, setPickerField] = useState<string | null>(null);

  const displayValue = (key: string, val: any): string => {
    if (Array.isArray(val)) return val.join(", ");
    return String(val ?? "");
  };

  const isImageField = (key: string) =>
    key === "image_url" || key === "images" || key === "img";

  return (
    <>
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

                {isImageField(f.key) ? (
                  <>
                    <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                      <input
                        style={{ flex: 1 }}
                        type="text"
                        value={displayValue(f.key, data[f.key])}
                        onChange={e => onChange(f.key, e.target.value)}
                        placeholder="URL gambar atau pilih dari media..."
                      />
                      <button
                        type="button"
                        className={styles.btnGhost}
                        style={{ whiteSpace: "nowrap", fontSize: 13 }}
                        onClick={() => setPickerField(f.key)}
                      >
                        <i className="bx bx-folder-open" /> Pilih
                      </button>
                    </div>
                    {data[f.key] &&
                      typeof data[f.key] === "string" &&
                      !data[f.key].includes(",") && (
                        <img
                          src={data[f.key]}
                          alt="preview"
                          style={{
                            marginTop: 6, maxHeight: 100, borderRadius: 6,
                            objectFit: "cover", border: "1px solid var(--adm-border)",
                          }}
                          onError={e => (e.currentTarget.style.display = "none")}
                        />
                    )}
                  </>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={f.rows ?? 4}
                    value={displayValue(f.key, data[f.key])}
                    onChange={e => onChange(f.key, e.target.value)}
                  />
                ) : f.type === "checkbox" ? (
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={!!data[f.key]}
                      onChange={e => onChange(f.key, e.target.checked)}
                    />
                    <span>{data[f.key] ? "Aktif" : "Nonaktif"}</span>
                  </label>
                ) : (
                  <input
                    type={f.type ?? "text"}
                    value={displayValue(f.key, data[f.key])}
                    onChange={e => onChange(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className={styles.formFooter}>
            <button className={styles.btnGhost} onClick={onClose}>Batal</button>
            <button className={styles.btnPrimary} onClick={onSave} disabled={saving}>
              {saving
                ? <><i className="bx bx-loader-alt bx-spin" /> Menyimpan...</>
                : <><i className="bx bx-save" /> Simpan</>
              }
            </button>
          </div>
        </div>
      </div>

      {pickerField && (
        <MediaPickerModal
          type="image"
          onPick={url => { onChange(pickerField, url); setPickerField(null); }}
          onClose={() => setPickerField(null)}
        />
      )}
    </>
  );
}

// ─── MEDIA MANAGER ────────────────────────────────────────────
function MediaManager() {
  const [items, setItems]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [folder, setFolder]         = useState("");
  const [filterType, setFilterType] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [confirm, setConfirm]       = useState<any>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [total, setTotal]           = useState(0);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set("search", search);
      if (folder)     params.set("folder", folder);
      if (filterType) params.set("type",   filterType);
      params.set("limit", "100");
      const res  = await fetch(`${api("/media")}&${params}`);
      const json = await res.json();
      setItems(json?.data?.items ?? []);
      setTotal(json?.data?.total ?? 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [search, folder, filterType]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteOne = async (item: any) => {
    setConfirm(null);
    try {
      const res  = await fetch(api(`/media/${item.id}`), { method: "DELETE" });
      const json = await res.json();
      if (json.status) { showToast("Media berhasil dihapus", "success"); load(); }
      else showToast(json.message || "Gagal menghapus", "error");
    } catch { showToast("Error jaringan", "error"); }
  };

  const deleteBulk = async () => {
    setConfirm(null);
    try {
      const res  = await fetch(api("/media/bulk"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const json = await res.json();
      if (json.status) {
        showToast(`${selected.size} media dihapus`, "success");
        setSelected(new Set());
        load();
      } else showToast(json.message || "Gagal menghapus", "error");
    } catch { showToast("Error jaringan", "error"); }
  };

  return (
    <div className={styles.sectionWrap}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmModal
          msg={confirm.bulk
            ? `Hapus ${selected.size} media yang dipilih?`
            : `Hapus "${confirm.original_name}"?`}
          onConfirm={() => confirm.bulk ? deleteBulk() : deleteOne(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {showUpload && (
        <MediaUploadModal
          onClose={() => { setShowUpload(false); load(); }}
          onUploaded={() => { setShowUpload(false); load(); }}
        />
      )}

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-folder-open" /> Media
          <span className={styles.count}>{total} file</span>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {selected.size > 0 && (
            <button className={styles.btnDanger} onClick={() => setConfirm({ bulk: true })}>
              <i className="bx bx-trash" /> Hapus ({selected.size})
            </button>
          )}
          <button className={styles.btnPrimary} onClick={() => setShowUpload(true)}>
            <i className="bx bx-upload" /> Upload
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          placeholder="Cari nama file..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 180,
            background: "var(--adm-surface)", color: "var(--adm-text)",
            border: "1px solid var(--adm-border)", borderRadius: 6, padding: "8px 12px",
          }}
        />
        <select
          value={folder}
          onChange={e => setFolder(e.target.value)}
          style={{
            background: "var(--adm-surface)", color: "var(--adm-text)",
            border: "1px solid var(--adm-border)", borderRadius: 6, padding: "8px 12px",
          }}
        >
          <option value="">Semua Folder</option>
          <option value="cavallery/images">cavallery/images</option>
          <option value="cavallery/videos">cavallery/videos</option>
          <option value="gallery">gallery</option>
          <option value="news">news</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            background: "var(--adm-surface)", color: "var(--adm-text)",
            border: "1px solid var(--adm-border)", borderRadius: 6, padding: "8px 12px",
          }}
        >
          <option value="">Semua Tipe</option>
          <option value="image">Gambar</option>
          <option value="video">Video</option>
        </select>
        <button className={styles.btnGhost} onClick={load}>
          <i className="bx bx-refresh" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingState}><i className="bx bx-loader-alt bx-spin" /> Memuat media...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", opacity: 0.4 }}>
          <i className="bx bx-image-alt" style={{ fontSize: "3rem" }} />
          <p>Belum ada media</p>
        </div>
      ) : (
        <div className={styles.mediaGrid}>
          {items.map(item => {
            const sel = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={`${styles.mediaCard} ${sel ? styles.mediaCardSelected : ""}`}
              >
                <div className={styles.mediaCheckbox} onClick={() => toggleSelect(item.id)}>
                  <i className={`bx ${sel ? "bx-checkbox-checked" : "bx-checkbox"}`} />
                </div>
                {item.type === "video" ? (
                  <div className={styles.videoThumb}>
                    <i className="bx bx-video-recording" style={{ fontSize: "2.5rem" }} />
                  </div>
                ) : (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.original_name}
                    className={styles.mediaCardImg}
                    loading="lazy"
                  />
                )}
                <div className={styles.mediaCardInfo}>
                  <div className={styles.mediaCardName} title={item.original_name}>
                    {item.original_name.length > 22
                      ? item.original_name.slice(0, 20) + "…"
                      : item.original_name}
                  </div>
                  <div className={styles.mediaCardMeta}>
                    <span className={`${styles.typeBadge} ${item.type === "video" ? styles.typeBadgeVideo : styles.typeBadgeImage}`}>
                      {item.type}
                    </span>
                    <span>{(item.file_size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
                <div className={styles.mediaCardActions}>
                  <button
                    title="Salin URL"
                    onClick={() => navigator.clipboard.writeText(item.public_url)}
                    className={styles.btnEdit}
                  >
                    <i className="bx bx-copy" />
                  </button>
                  <a
                    href={item.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnEdit}
                    title="Buka"
                  >
                    <i className="bx bx-link-external" />
                  </a>
                  <button
                    className={styles.btnDel}
                    onClick={() => setConfirm(item)}
                    title="Hapus"
                  >
                    <i className="bx bx-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DISCORD MANAGER ──────────────────────────────────────────
interface DiscordLog {
  time: string;
  title: string;
  mention: string;
  hasImage: boolean;
}

function DiscordManager() {
  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [url,      setUrl]      = useState("https://cavallery.id");
  const [image,    setImage]    = useState("");
  const [mention,  setMention]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [logs,     setLogs]     = useState<DiscordLog[]>([]);
  const [toast,    setToast]    = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const STORAGE_KEY = "cava_discord_logs";

  // Load logs dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLogs(JSON.parse(raw));
    } catch {}
  }, []);

  const saveLogs = (newLogs: DiscordLog[]) => {
    setLogs(newLogs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs)); } catch {}
  };

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const now = () => {
    return new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const send = async () => {
    if (!title.trim() || !desc.trim()) {
      showToast("Judul dan deskripsi wajib diisi", "error");
      return;
    }
    setSending(true);
    try {
      const time    = now();
      const payload = {
        title:       "📌 " + title.trim(),
        description: desc.trim() + "\n\n🕐 " + time,
        url:         url.trim() || "https://cavallery.id",
        mention:     mention || "",
        image:       image.trim() || "",
      };

      const res = await fetch(DISCORD_API, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("✅ Berhasil dikirim ke Discord!", "success");
        // Simpan ke log
        const newLog: DiscordLog = {
          time,
          title:    title.trim(),
          mention:  mention || "—",
          hasImage: !!image.trim(),
        };
        const updated = [newLog, ...logs].slice(0, 30);
        saveLogs(updated);
        // Reset form
        setTitle(""); setDesc(""); setImage(""); setMention("");
      } else {
        const body = await res.text();
        showToast(`❌ Gagal (${res.status}): ${body.slice(0, 80)}`, "error");
      }
    } catch (e: any) {
      showToast("❌ Error jaringan: " + (e?.message ?? "unknown"), "error");
    }
    setSending(false);
  };

  const clearLogs = () => {
    saveLogs([]);
    setConfirmClear(false);
    showToast("Log dihapus", "success");
  };

  // Preview embed warna sesuai mention
  const embedColor =
    mention === "@everyone" ? "#e05252" :
    mention === "@here"     ? "#d97706" :
    "#5865f2";

  return (
    <div className={styles.sectionWrap}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirmClear && (
        <ConfirmModal
          msg="Hapus semua riwayat pengiriman Discord?"
          onConfirm={clearLogs}
          onCancel={() => setConfirmClear(false)}
        />
      )}
      {showPicker && (
        <MediaPickerModal
          type="image"
          onPick={url => { setImage(url); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bxl-discord-alt" style={{ color: "#5865f2" }} /> Discord Notifier
        </h2>
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.discordLayout}>

        {/* ── FORM PANEL ── */}
        <div className={styles.discordForm}>
          <div className={styles.discordFormInner}>

            {/* Judul */}
            <div className={styles.field}>
              <label>Judul Update <span style={{ color: "#e05252" }}>*</span></label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Masukkan judul pengumuman..."
                maxLength={256}
              />
              <span style={{ fontSize: 11, color: "#555", textAlign: "right" }}>{title.length}/256</span>
            </div>

            {/* Deskripsi */}
            <div className={styles.field}>
              <label>Deskripsi <span style={{ color: "#e05252" }}>*</span></label>
              <textarea
                rows={6}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Tulis detail pengumuman di sini..."
                maxLength={2000}
              />
              <span style={{ fontSize: 11, color: "#555", textAlign: "right" }}>{desc.length}/2000</span>
            </div>

            {/* URL */}
            <div className={styles.field}>
              <label>URL Website</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://cavallery.id"
              />
            </div>

            {/* Gambar */}
            <div className={styles.field}>
              <label>Gambar <span style={{ color: "#777", fontWeight: 400 }}>(opsional)</span></label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="URL gambar atau pilih dari media..."
                  style={{ flex: 1 }}
                />
                <button
                  className={styles.btnGhost}
                  style={{ whiteSpace: "nowrap", fontSize: 13 }}
                  onClick={() => setShowPicker(true)}
                >
                  <i className="bx bx-folder-open" /> Pilih
                </button>
                {image && (
                  <button
                    className={styles.btnDel}
                    style={{ width: 36, height: 36, flexShrink: 0 }}
                    onClick={() => setImage("")}
                    title="Hapus gambar"
                  >
                    <i className="bx bx-x" />
                  </button>
                )}
              </div>
              {image && (
                <img
                  src={image}
                  alt="preview"
                  style={{
                    marginTop: 8, maxHeight: 120, borderRadius: 8,
                    objectFit: "cover", border: "1px solid var(--adm-border)", width: "100%",
                  }}
                  onError={e => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {/* Mention */}
            <div className={styles.field}>
              <label>Mention</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["", "@everyone", "@here"].map(m => (
                  <button
                    key={m}
                    onClick={() => setMention(m)}
                    style={{
                      flex: 1,
                      padding: "8px 4px",
                      borderRadius: 8,
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "all 0.15s",
                      borderColor: mention === m
                        ? (m === "@everyone" ? "#e05252" : m === "@here" ? "#d97706" : "#5865f2")
                        : "#333",
                      background: mention === m
                        ? (m === "@everyone" ? "#3a1a1a" : m === "@here" ? "#2a1e10" : "#1a1d3a")
                        : "transparent",
                      color: mention === m
                        ? (m === "@everyone" ? "#e05252" : m === "@here" ? "#f59e0b" : "#7289da")
                        : "#777",
                    }}
                  >
                    {m || "Tanpa Mention"}
                  </button>
                ))}
              </div>
            </div>

            {/* Send button */}
            <button
              className={styles.btnPrimary}
              onClick={send}
              disabled={sending || !title.trim() || !desc.trim()}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.65rem",
                fontSize: "0.9rem",
                background: sending ? "#333" : "linear-gradient(135deg, #5865f2, #7289da)",
                color: "#fff",
              }}
            >
              {sending
                ? <><i className="bx bx-loader-alt bx-spin" /> Mengirim ke Discord...</>
                : <><i className="bx bxl-discord-alt" /> Kirim Sekarang</>
              }
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Preview + Logs ── */}
        <div className={styles.discordRight}>

          {/* Embed Preview */}
          <div className={styles.discordPreviewCard}>
            <p className={styles.discordPreviewLabel}>
              <i className="bx bx-show" /> Preview Embed
            </p>
            <div
              className={styles.discordEmbed}
              style={{ borderLeftColor: embedColor }}
            >
              {mention && (
                <div className={styles.discordMention}
                  style={{
                    color: mention === "@everyone" ? "#e05252" : "#f59e0b",
                    background: mention === "@everyone" ? "#3a1a1a" : "#2a1e10",
                  }}>
                  {mention}
                </div>
              )}
              <div className={styles.discordEmbedTitle}>
                {title ? "📌 " + title : <span style={{ opacity: 0.3 }}>Judul pengumuman...</span>}
              </div>
              <div className={styles.discordEmbedDesc}>
                {desc
                  ? desc.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)
                  : <span style={{ opacity: 0.3 }}>Deskripsi pengumuman...</span>
                }
                {desc && (
                  <><br /><span style={{ opacity: 0.5, fontSize: 11 }}>🕐 {now()}</span></>
                )}
              </div>
              {image && (
                <img
                  src={image}
                  alt="embed"
                  className={styles.discordEmbedImg}
                  onError={e => (e.currentTarget.style.display = "none")}
                />
              )}
              {url && (
                <div className={styles.discordEmbedUrl}>
                  <i className="bx bx-link-external" style={{ fontSize: 11 }} /> {url}
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div className={styles.discordLogsCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p className={styles.discordPreviewLabel} style={{ margin: 0 }}>
                <i className="bx bx-history" /> Riwayat ({logs.length})
              </p>
              {logs.length > 0 && (
                <button
                  className={styles.btnDel}
                  style={{ width: "auto", height: "auto", padding: "3px 10px", fontSize: 11, borderRadius: 6 }}
                  onClick={() => setConfirmClear(true)}
                >
                  Hapus Log
                </button>
              )}
            </div>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", opacity: 0.3, fontSize: 13 }}>
                <i className="bx bx-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: 4 }} />
                Belum ada riwayat
              </div>
            ) : (
              <div className={styles.discordLogList}>
                {logs.map((log, i) => (
                  <div key={i} className={styles.discordLogItem}>
                    <div className={styles.discordLogTitle}>{log.title}</div>
                    <div className={styles.discordLogMeta}>
                      <span>{log.time}</span>
                      {log.mention !== "—" && (
                        <span style={{
                          background: log.mention === "@everyone" ? "#3a1a1a" : "#2a1e10",
                          color:      log.mention === "@everyone" ? "#e05252" : "#f59e0b",
                          padding: "1px 6px", borderRadius: 4, fontSize: 10,
                        }}>{log.mention}</span>
                      )}
                      {log.hasImage && (
                        <span style={{ color: "#5865f2", fontSize: 10 }}>
                          <i className="bx bx-image" /> gambar
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION MANAGER ──────────────────────────────────────────
function SectionManager({ section }: { section: Section }) {
  const [rows, setRows]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<"add" | "edit" | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState<any>(null);
  const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

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
        { key: "slug",         label: "Slug" },
        { key: "title",        label: "Judul" },
        { key: "label",        label: "Label" },
        { key: "description",  label: "Deskripsi Singkat",    type: "textarea", rows: 2 },
        { key: "content",      label: "Konten Lengkap",       type: "textarea", rows: 6 },
        { key: "image_url",    label: "URL Gambar Utama" },
        { key: "images",       label: "URL Gambar Dokumentasi", hint: "pisahkan dengan koma", type: "textarea", rows: 2 },
        { key: "link_url",     label: "Link URL" },
        { key: "published_at", label: "Tanggal Publish",      type: "datetime-local" },
        { key: "is_active",    label: "Aktif",                type: "checkbox" },
        { key: "is_pinned",    label: "Pin",                  type: "checkbox" },
      ],
    },
    timeline: {
      endpoint: "/timeline", listKey: "events",
      cols: [
        { key: "year", label: "Tahun" }, { key: "date_label", label: "Tanggal" },
        { key: "title", label: "Judul" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "year",        label: "Tahun" },
        { key: "event_date",  label: "Tanggal Event", type: "date" },
        { key: "date_label",  label: "Label Tanggal" },
        { key: "title",       label: "Judul" },
        { key: "description", label: "Deskripsi",    type: "textarea", rows: 3 },
        { key: "image_url",   label: "URL Gambar" },
        { key: "sort_order",  label: "Urutan",       type: "number" },
        { key: "is_active",   label: "Aktif",        type: "checkbox" },
      ],
    },
    gallery: {
      endpoint: "/gallery", listKey: "items",
      cols: [
        { key: "image_url", label: "Gambar" }, { key: "title", label: "Judul" },
        { key: "date_label", label: "Tanggal" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "title",      label: "Judul" },
        { key: "image_url",  label: "URL Gambar" },
        { key: "date_label", label: "Label Tanggal" },
        { key: "alt_text",   label: "Alt Text" },
        { key: "tags",       label: "Tags", hint: "pisahkan dengan koma, boleh kosong" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active",  label: "Aktif",  type: "checkbox" },
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
        { key: "title",      label: "Judul" },
        { key: "date_range", label: "Periode (cth: 1 Jan - Present)" },
        { key: "badge",      label: "Badge (cth: 3 Shows)" },
        { key: "image_url",  label: "URL Gambar" },
        { key: "songs",      label: "Songs", hint: "pisahkan dengan koma", type: "textarea", rows: 3 },
        { key: "show_count", label: "Jumlah Show", type: "number" },
        { key: "sort_order", label: "Urutan",      type: "number" },
        { key: "is_active",  label: "Aktif",       type: "checkbox" },
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
        { key: "stat_key",   label: "Stat Key (cth: total_shows)" },
        { key: "label",      label: "Label" },
        { key: "value",      label: "Nilai",  type: "number" },
        { key: "icon",       label: "Icon (cth: bx-calendar)" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active",  label: "Aktif",  type: "checkbox" },
      ],
    },
    youtube: {
      endpoint: "/youtube", listKey: "videos",
      cols: [
        { key: "title", label: "Judul" }, { key: "category", label: "Kategori" },
        { key: "video_id", label: "Video ID" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "title",      label: "Judul" },
        { key: "url",        label: "URL YouTube" },
        { key: "category",   label: "Kategori" },
        { key: "sort_order", label: "Urutan", type: "number" },
        { key: "is_active",  label: "Aktif",  type: "checkbox" },
      ],
    },
    funfacts: {
      endpoint: "/funfacts", listKey: "",
      cols: [
        { key: "content", label: "Konten" }, { key: "sort_order", label: "Urutan" },
        { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "content",    label: "Konten Funfact", type: "textarea", rows: 3 },
        { key: "sort_order", label: "Urutan",         type: "number" },
        { key: "is_active",  label: "Aktif",          type: "checkbox" },
      ],
    },
    kabesha: {
      endpoint: "/kabesha", listKey: "",
      cols: [
        { key: "image_url", label: "Gambar" }, { key: "year_label", label: "Tahun" },
        { key: "title", label: "Judul" }, { key: "is_active", label: "Aktif" },
      ],
      fields: [
        { key: "year_label",  label: "Label Tahun" },
        { key: "title",       label: "Judul" },
        { key: "description", label: "Deskripsi", type: "textarea", rows: 3 },
        { key: "image_url",   label: "URL Gambar" },
        { key: "sort_order",  label: "Urutan",    type: "number" },
        { key: "is_active",   label: "Aktif",     type: "checkbox" },
      ],
    },
    dashboard: { endpoint: "", listKey: "", cols: [], fields: [] },
    media:     { endpoint: "", listKey: "", cols: [], fields: [] },
    discord:   { endpoint: "", listKey: "", cols: [], fields: [] },
  };

  const c = cfg[section];

  const load = useCallback(async () => {
    if (section === "dashboard" || section === "media" || section === "discord") return;
    setLoading(true);
    try {
      const res  = await fetch(api(c.endpoint));
      const json = await res.json();
      const data = json?.data;
      if      (Array.isArray(data))            setRows(data);
      else if (data?.news)                     setRows(data.news);
      else if (data?.items)                    setRows(data.items);
      else if (data?.videos)                   setRows(data.videos);
      else if (data?.events)                   setRows(data.events);
      else if (c.listKey && data?.[c.listKey]) setRows(data[c.listKey]);
      else                                     setRows([]);
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
      const url     = isEdit ? api(`${c.endpoint}/${editId}`) : api(c.endpoint);
      const payload = preparePayload(section, formData);
      const res     = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status) {
        showToast(isEdit ? "Berhasil diperbarui!" : "Berhasil ditambahkan!", "success");
        setModal(null);
        load();
      } else {
        showToast(json.message || "Gagal menyimpan", "error");
      }
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
      else showToast(json.message || "Gagal menghapus", "error");
    } catch { showToast("Terjadi kesalahan jaringan", "error"); }
  };

  if (section === "dashboard" || section === "media" || section === "discord") return null;

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
          fields={c.fields}
          data={formData}
          onChange={(k, v) => setFormData(prev => ({ ...prev, [k]: v }))}
          onSave={save}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <i className="bx bx-data" /> {section.charAt(0).toUpperCase() + section.slice(1)}
          <span className={styles.count}>{rows.length} item</span>
        </h2>
        <button className={styles.btnPrimary} onClick={openAdd}>
          <i className="bx bx-plus" /> Tambah
        </button>
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
      { key: "media",    path: "/media"    },
    ] as { key: string; path: string }[]).forEach(async ({ key, path }) => {
      try {
        const res  = await fetch(api(path));
        const json = await res.json();
        const data = json?.data;
        let count = 0;
        if      (Array.isArray(data))       count = data.length;
        else if (data?.total !== undefined) count = data.total;
        else if (data?.news)                count = data.news.length;
        else if (data?.items)               count = data.items.length;
        else if (data?.videos)              count = data.videos.length;
        else if (data?.events)              count = data.events.length;
        setCounts(prev => ({ ...prev, [key]: count }));
      } catch {}
    });
  }, []);

  const cards: { key: Section; icon: string; label: string; color: string }[] = [
    { key: "news",      icon: "bx-news",          label: "News",     color: "#b45309" },
    { key: "timeline",  icon: "bx-history",       label: "Timeline", color: "#047857" },
    { key: "gallery",   icon: "bx-image-alt",     label: "Gallery",  color: "#7c3aed" },
    { key: "setlists",  icon: "bx-music",         label: "Setlists", color: "#0369a1" },
    { key: "youtube",   icon: "bxl-youtube",      label: "YouTube",  color: "#dc2626" },
    { key: "funfacts",  icon: "bx-laugh",         label: "Funfacts", color: "#059669" },
    { key: "kabesha",   icon: "bx-star",          label: "Kabesha",  color: "#d97706" },
    { key: "stats",     icon: "bx-bar-chart",     label: "Stats",    color: "#9333ea" },
    { key: "media",     icon: "bx-folder-open",   label: "Media",    color: "#0891b2" },
    { key: "discord",   icon: "bxl-discord-alt",  label: "Discord",  color: "#5865f2" },
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
          <button
            key={card.key}
            className={styles.dashCard}
            onClick={() => onNav(card.key)}
            style={{ "--accent": card.color } as any}
          >
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
  { key: "dashboard", icon: "bx-home-alt",       label: "Dashboard" },
  { key: "news",      icon: "bx-news",           label: "News"      },
  { key: "timeline",  icon: "bx-history",        label: "Timeline"  },
  { key: "gallery",   icon: "bx-image-alt",      label: "Gallery"   },
  { key: "setlists",  icon: "bx-music",          label: "Setlists"  },
  { key: "youtube",   icon: "bxl-youtube",       label: "YouTube"   },
  { key: "funfacts",  icon: "bx-laugh",          label: "Funfacts"  },
  { key: "kabesha",   icon: "bx-star",           label: "Kabesha"   },
  { key: "stats",     icon: "bx-bar-chart",      label: "Stats"     },
  { key: "media",     icon: "bx-folder-open",    label: "Media"     },
  { key: "discord",   icon: "bxl-discord-alt",   label: "Discord"   },
];

// ─── MAIN ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed,     setAuthed]     = useState(false);
  const [checking,   setChecking]   = useState(true);
  const [active,     setActive]     = useState<Section>("dashboard");
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

        {/* DESKTOP SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sideTop}>
            <div className={styles.sideLogo}>
              <i className="bx bxs-shield-alt-2" />
              <span>Cavallery</span>
            </div>
            <nav className={styles.nav}>
              {navItems.map(n => (
                <button
                  key={n.key}
                  className={`${styles.navItem} ${active === n.key ? styles.navActive : ""}`}
                  onClick={() => navigate(n.key)}
                >
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

        {/* MOBILE DRAWER */}
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
                    <button
                      key={n.key}
                      className={`${styles.navItem} ${active === n.key ? styles.navActive : ""}`}
                      onClick={() => navigate(n.key)}
                    >
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

        {/* MAIN AREA */}
        <div className={styles.mainArea}>
          <header className={styles.topbar}>
            <button className={styles.menuBtn} onClick={() => setDrawerOpen(true)}>
              <i className="bx bx-menu" />
            </button>
            <div className={styles.topbarTitle}>
              {navItems.find(n => n.key === active)?.label ?? "Dashboard"}
            </div>
            <div className={styles.topbarRight}>
              <span className={styles.adminBadge}><i className="bx bx-user" /> Admin</span>
              <button className={styles.logoutIconBtn} onClick={logout} title="Keluar">
                <i className="bx bx-log-out" />
              </button>
            </div>
          </header>

          <div className={styles.content}>
            {active === "dashboard" ? (
              <DashboardHome onNav={setActive} />
            ) : active === "media" ? (
              <MediaManager />
            ) : active === "discord" ? (
              <DiscordManager />
            ) : (
              <SectionManager section={active} />
            )}
          </div>
        </div>
      </div>
    </AdminPortal>
  );
}
