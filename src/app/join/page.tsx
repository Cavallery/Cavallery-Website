"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface RoleConfig {
  id: string;
  title: string;
  description: string;
  is_open: boolean | number;
}

const ROLES_INFO: Record<
  string,
  {
    icon: string;
    iconBg: string;
    color: string;
    perks: string[];
    divisionOptions?: string[];
  }
> = {
  member: {
    icon: "bx-user-pin",
    iconBg: "rgba(37, 99, 235, 0.12)",
    color: "#2563eb",
    perks: [
      "Akses grup koordinasi & gathering resmi",
      "Prioritas proyek ulang tahun & event",
      "Keluarga besar Cavallery se-Indonesia",
    ],
  },
  admin: {
    icon: "bx-shield-quarter",
    iconBg: "var(--gold-dim, rgba(180, 83, 9, 0.12))",
    color: "var(--gold, #b45309)",
    perks: [
      "Tim pengurus & perencana resmi Cavallery",
      "7 divisi: IT, Humas, Desain, Esport, Keuangan, dll.",
      "Pengalaman manajemen organisasi fanbase profesional",
    ],
    divisionOptions: [
      "Koordinator Lapangan",
      "IT",
      "Humas",
      "Desain",
      "Esport",
      "Finansial / Keuangan",
      "Sekretariat",
    ],
  },
  volunteer: {
    icon: "bx-donate-heart",
    iconBg: "rgba(219, 39, 119, 0.12)",
    color: "#db2777",
    perks: [
      "Relawan pelaksana kegiatan lapangan",
      "Event gathering, perayaan & santunan sosial",
      "Networking seru sesama fans Erine",
    ],
    divisionOptions: [
      "Event & Gathering",
      "Perayaan Ulang Tahun (Birthday Project)",
      "Santunan Sosial & Baksos",
      "Logistik & Lapangan",
    ],
  },
};

export default function JoinPage() {
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalRole, setActiveModalRole] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [division, setDivision] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/recruitment")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRoles(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openForm = (roleId: string) => {
    setActiveModalRole(roleId);
    setFullName("");
    setNickname("");
    setCity("");
    setWhatsapp("");
    setSocialMedia("");
    setDivision("");
    setReason("");
    setFormError("");
    setSubmitted(false);
  };

  const closeModal = () => {
    setActiveModalRole(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !city.trim() || !whatsapp.trim()) {
      setFormError("Mohon lengkapi data wajib (Nama Lengkap, Kota, dan No. WhatsApp).");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/recruitment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_id: activeModalRole,
          full_name: fullName,
          nickname,
          city,
          whatsapp,
          social_media: socialMedia,
          division,
          reason,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted(true);
      } else {
        setFormError(json.message || "Gagal mengirim pendaftaran. Silakan coba lagi.");
      }
    } catch {
      setFormError("Terjadi kendala jaringan. Silakan coba kembali beberapa saat lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentRoleConfig = roles.find((r) => r.id === activeModalRole);
  const currentRoleInfo = activeModalRole ? ROLES_INFO[activeModalRole] : null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge">
            <i className="fa-solid fa-chess-knight" /> Official Fanbase Recruitment
          </div>
          <h1 className={styles.heroTitle}>
            Bergabung Bersama Komunitas <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroSub}>
            Pilih Peranmu & Dukung Erine (Catherina Vallencia) JKT48! Kami membuka pintu bagi seluruh fans dan pendukung untuk menjadi anggota resmi, tim pengurus, maupun relawan kegiatan kebersamaan Cavallery.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.cardsGrid}>
          {["member", "admin", "volunteer"].map((roleId) => {
            const role = roles.find((r) => r.id === roleId);
            const info = ROLES_INFO[roleId];
            const isOpen = Boolean(role?.is_open);

            return (
              <div key={roleId} className={styles.roleCard}>
                <div
                  className={styles.roleIconWrap}
                  style={{ background: info.iconBg, color: info.color }}
                >
                  <i className={`bx ${info.icon}`} />
                </div>

                <div className={styles.roleHeader}>
                  <h2 className={styles.roleTitle}>{role?.title || `Join ${roleId}`}</h2>
                  <span
                    className={`${styles.statusBadge} ${
                      isOpen ? styles.statusOpen : styles.statusClosed
                    }`}
                  >
                    <i className={`bx ${isOpen ? "bx-check-circle" : "bx-lock-alt"}`} />
                    {isOpen ? "Buka" : "Tutup"}
                  </span>
                </div>

                <p className={styles.roleDesc}>
                  {role?.description || "Bergabung bersama keluarga besar Cavallery."}
                </p>

                <ul className={styles.rolePerks}>
                  {info.perks.map((perk, i) => (
                    <li key={i}>
                      <i className="bx bx-check" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                {isOpen ? (
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnOpen}`}
                    onClick={() => openForm(roleId)}
                  >
                    <i className="bx bx-edit-alt" />
                    Pilih & Daftar
                  </button>
                ) : (
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnClosed}`}
                    disabled
                  >
                    <i className="bx bx-lock-alt" />
                    Pendaftaran Ditutup
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Form */}
      {activeModalRole && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <i className={`bx ${currentRoleInfo?.icon}`} />
                Formulir {currentRoleConfig?.title}
              </h3>
              <button className={styles.closeBtn} onClick={closeModal}>
                <i className="bx bx-x" />
              </button>
            </div>

            {submitted ? (
              <div className={styles.successBox}>
                <i className={`bx bx-check-circle ${styles.successIcon}`} />
                <h3 className={styles.successTitle}>Pendaftaran Berhasil Dikirim!</h3>
                <p className={styles.successDesc}>
                  Terima kasih sudah mendaftar untuk {currentRoleConfig?.title}. Data kamu sudah tersimpan di sistem kami. Pengurus Cavallery akan menghubungi kamu melalui WhatsApp untuk konfirmasi dan proses selanjutnya.
                </p>
                <button className={styles.submitBtn} onClick={closeModal} style={{ margin: "0 auto", minWidth: 160 }}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                {formError && (
                  <div className={styles.errorBox}>
                    <i className="bx bx-error-circle" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className={styles.field}>
                  <label>
                    Nama Lengkap <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Catherina Vallencia Kurniawan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Nama Panggilan / Nickname</label>
                  <input
                    type="text"
                    placeholder="Contoh: Erine"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    Kota Domisili <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta / Surabaya / Bandung"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    Nomor WhatsApp / Telegram <span>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Akun Media Sosial / Discord (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: @username_x / discord_tag#0000"
                    value={socialMedia}
                    onChange={(e) => setSocialMedia(e.target.value)}
                  />
                </div>

                {currentRoleInfo?.divisionOptions && (
                  <div className={styles.field}>
                    <label>Pilihan Divisi / Bidang Minat</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                    >
                      <option value="">-- Pilih Divisi / Minat --</option>
                      {currentRoleInfo.divisionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.field}>
                  <label>Alasan Ingin Bergabung / Pengalaman Singkat</label>
                  <textarea
                    placeholder="Ceritakan motivasi kamu bergabung bersama Cavallery..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Mengirim...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send" /> Kirim Pendaftaran
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
