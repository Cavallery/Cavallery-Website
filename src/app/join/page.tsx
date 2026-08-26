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
      "Akses grup koordinasi LINE resmi",
      "Prioritas proyek ulang tahun & Request Hour",
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

  // Common Form states
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [division, setDivision] = useState("");
  const [reason, setReason] = useState("");

  // Member Registration Form specific states
  const [email, setEmail] = useState("");
  const [feeAgreed, setFeeAgreed] = useState(false);
  const [infoSource, setInfoSource] = useState("X");
  const [infoSourceOther, setInfoSourceOther] = useState("");
  const [gender, setGender] = useState("Perempuan");
  const [lineId, setLineId] = useState("");
  const [lineDisplayName, setLineDisplayName] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [hobbyOther, setHobbyOther] = useState("");
  const [usernameX, setUsernameX] = useState("");
  const [usernameIg, setUsernameIg] = useState("");
  const [usernameTiktok, setUsernameTiktok] = useState("");
  const [reasonMember, setReasonMember] = useState("Aku Erine Oshi banget");
  const [reasonMemberOther, setReasonMemberOther] = useState("");
  const [supportTypes, setSupportTypes] = useState<string[]>([
    "Aku akan aktif interaksi di grup",
  ]);
  const [supportTypeOther, setSupportTypeOther] = useState("");
  const [activitySuggestion, setActivitySuggestion] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`/api/recruitment?t=${Date.now()}`, { cache: "no-store" })
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
    setEmail("");
    setFeeAgreed(false);
    setInfoSource("X");
    setInfoSourceOther("");
    setGender("Perempuan");
    setLineId("");
    setLineDisplayName("");
    setHobbies([]);
    setHobbyOther("");
    setUsernameX("");
    setUsernameIg("");
    setUsernameTiktok("");
    setReasonMember("Aku Erine Oshi banget");
    setReasonMemberOther("");
    setSupportTypes(["Aku akan aktif interaksi di grup"]);
    setSupportTypeOther("");
    setActivitySuggestion("");
    setFormError("");
    setSubmitted(false);
  };

  const closeModal = () => {
    setActiveModalRole(null);
    setSubmitted(false);
  };

  const toggleHobby = (h: string) => {
    setHobbies((prev) =>
      prev.includes(h) ? prev.filter((item) => item !== h) : [...prev, h]
    );
  };

  const toggleSupportType = (s: string) => {
    setSupportTypes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (activeModalRole === "member") {
      if (!email.trim()) {
        setFormError("Mohon isi Email Anda.");
        return;
      }
      if (!feeAgreed) {
        setFormError("Anda wajib menyetujui ketentuan iuran Rp75.000 untuk melanjutkan pendaftaran.");
        return;
      }
      if (!fullName.trim()) {
        setFormError("Mohon isi Nama Lengkap.");
        return;
      }
      if (!lineId.trim()) {
        setFormError("Mohon isi ID Line.");
        return;
      }
      if (!lineDisplayName.trim()) {
        setFormError("Mohon isi Display Name Line.");
        return;
      }
      if (!city.trim()) {
        setFormError("Mohon tuliskan Kota atau Kabupaten Domisili Anda.");
        return;
      }
      if (hobbies.length === 0 && !hobbyOther.trim()) {
        setFormError("Mohon pilih minimal satu Hobby.");
        return;
      }
      if (!usernameX.trim() && !usernameIg.trim() && !usernameTiktok.trim()) {
        setFormError("Mohon isi minimal satu akun media sosial aktif (X, Instagram, atau TikTok).");
        return;
      }
      if (supportTypes.length === 0 && !supportTypeOther.trim()) {
        setFormError("Mohon pilih bentuk support yang akan Anda berikan.");
        return;
      }
    } else {
      if (!fullName.trim() || !city.trim() || !whatsapp.trim()) {
        setFormError("Mohon lengkapi data wajib (Nama Lengkap, Kota, dan No. WhatsApp).");
        return;
      }
    }

    setSubmitting(true);

    try {
      const finalHobbyList = [...hobbies];
      if (hobbyOther.trim()) finalHobbyList.push(hobbyOther.trim());

      const finalSupportList = [...supportTypes];
      if (supportTypeOther.trim()) finalSupportList.push(supportTypeOther.trim());

      const chosenReason =
        reasonMember === "Yang lain" && reasonMemberOther.trim()
          ? reasonMemberOther.trim()
          : reasonMember;

      const chosenSource =
        infoSource === "Yang lain" && infoSourceOther.trim()
          ? infoSourceOther.trim()
          : infoSource;

      const payload =
        activeModalRole === "member"
          ? {
              role_id: "member",
              email: email.trim(),
              full_name: fullName.trim(),
              info_source: chosenSource,
              gender,
              line_id: lineId.trim(),
              line_display_name: lineDisplayName.trim(),
              city: city.trim(),
              hobby: finalHobbyList,
              username_x: usernameX.trim() || null,
              username_ig: usernameIg.trim() || null,
              username_tiktok: usernameTiktok.trim() || null,
              reason: chosenReason,
              support_type: finalSupportList,
              activity_suggestion: activitySuggestion.trim() || null,
              fee_agreed: feeAgreed ? 1 : 0,
              whatsapp: lineId.trim(),
            }
          : {
              role_id: activeModalRole,
              full_name: fullName.trim(),
              nickname: nickname.trim() || null,
              city: city.trim(),
              whatsapp: whatsapp.trim(),
              social_media: socialMedia.trim() || null,
              division: division.trim() || null,
              reason: reason.trim() || null,
            };

      const res = await fetch("/api/recruitment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
                  style={{ background: info?.iconBg || "rgba(255,255,255,0.1)", color: info?.color || "#b45309" }}
                >
                  <i className={`bx ${info?.icon || "bx-group"}`} />
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
                  {info?.perks.map((perk, i) => (
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
                {activeModalRole === "member"
                  ? "Cavallery Registration Form"
                  : `Formulir ${currentRoleConfig?.title || activeModalRole}`}
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
                  {activeModalRole === "member"
                    ? "Terima kasih sudah mendaftar di Cavallery! Data kamu akan di-screening oleh tim admin. Calon anggota yang terpilih akan dihubungi untuk konfirmasi dan pemberian QRIS iuran."
                    : `Terima kasih sudah mendaftar untuk ${currentRoleConfig?.title}. Data kamu sudah tersimpan dan akan segera diperiksa oleh pengurus Cavallery.`}
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

                {/* ─── MEMBER REGISTRATION FORM ─── */}
                {activeModalRole === "member" ? (
                  <>
                    <div className={styles.formHeaderNotice}>
                      <div className={styles.noticeText}>
                        <strong>Selamat datang di Cavallery!</strong><br />
                        Cavallery memiliki peraturan umum yang wajib dipatuhi oleh seluruh anggota. Dengan mengisi formulir ini maka calon anggota yang terpilih wajib mematuhi peraturan yang tersedia demi kenyamanan bersama!
                      </div>
                      <div className={styles.noticeBadges}>
                        <span className={styles.noticeBadge}>
                          <i className="bx bx-calendar-event" /> Formulir akan ditutup pada 20 April 2026!
                        </span>
                        <span className={styles.noticeBadge}>
                          <i className="bx bxl-line" /> CAVALLERY MENGGUNAKAN APLIKASI LINE SEBAGAI GRUP
                        </span>
                        <span className={styles.noticeBadge}>
                          <i className="bx bx-qr-scan" /> QRIS pembayaran iuran diberikan ketika kamu dihubungi admin
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <div className={styles.field}>
                      <label>
                        Email <span>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="contoh@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* DISCLAIMER Box */}
                    <div className={styles.disclaimerBox}>
                      <div className={styles.disclaimerTitle}>
                        <i className="bx bx-error-alt" /> DISCLAIMER
                      </div>
                      <div className={styles.disclaimerBody}>
                        Sebelum melanjutkan pendaftaran, harap diperhatikan bahwa calon anggota Cavallery yang terpilih memiliki kewajiban untuk membayar iuran sebesar <strong>Rp75.000</strong>.<br />
                        Iuran tersebut akan dialokasikan sebagai berikut:
                        <ul>
                          <li><strong>60%</strong> untuk kebutuhan Project Request Hour</li>
                          <li><strong>40%</strong> untuk kas fanbase (berlaku hingga periode Mei 2026)</li>
                        </ul>
                        Dengan pembayaran ini, anggota baru tidak perlu melakukan pembayaran kas hingga akhir Mei 2026, dan akan mulai aktif kembali pada periode berikutnya.<br />
                        Jika Anda tidak bersedia berpartisipasi dalam iuran ini, Anda dipersilakan untuk tidak melanjutkan proses pendaftaran. Terima kasih atas pengertiannya.
                      </div>
                      <label className={styles.checkboxAgree}>
                        <input
                          type="checkbox"
                          checked={feeAgreed}
                          onChange={(e) => setFeeAgreed(e.target.checked)}
                          required
                        />
                        <span>Bersedia (Saya memahami dan menyetujui ketentuan iuran) *</span>
                      </label>
                    </div>

                    {/* DATA DIRI SECTION */}
                    <div className={styles.sectionDivider}>
                      <div className={styles.sectionHeading}>
                        <i className="bx bx-user" /> Data Diri
                      </div>
                    </div>

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

                    {/* Informasi open form */}
                    <div className={styles.field}>
                      <label>
                        Informasi open form didapatkan dari <span>*</span>
                      </label>
                      <div className={styles.optionsGrid}>
                        {["X", "Instagram", "Tiktok", "Yang lain"].map((src) => (
                          <label key={src} className={styles.optionLabel}>
                            <input
                              type="radio"
                              name="infoSource"
                              value={src}
                              checked={infoSource === src}
                              onChange={(e) => setInfoSource(e.target.value)}
                            />
                            <span>{src}</span>
                          </label>
                        ))}
                      </div>
                      {infoSource === "Yang lain" && (
                        <input
                          type="text"
                          className={styles.otherInput}
                          placeholder="Sebutkan sumber lainnya..."
                          value={infoSourceOther}
                          onChange={(e) => setInfoSourceOther(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Gender */}
                    <div className={styles.field}>
                      <label>
                        Gender <span>*</span>
                      </label>
                      <div className={styles.optionsGrid}>
                        {["Perempuan", "Laki Laki"].map((g) => (
                          <label key={g} className={styles.optionLabel}>
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={gender === g}
                              onChange={(e) => setGender(e.target.value)}
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* ID Line */}
                    <div className={styles.field}>
                      <label>
                        ID Line <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: line_username123"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        required
                      />
                    </div>

                    {/* Display Name Line */}
                    <div className={styles.field}>
                      <label>
                        Display Name Line <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nama tampilan akun LINE kamu"
                        value={lineDisplayName}
                        onChange={(e) => setLineDisplayName(e.target.value)}
                        required
                      />
                      <span className={styles.fieldSubtext}>
                        ⚠️ Kami tidak bertanggungjawab jika nantinya terkena pembersihan karena tidak dikenali akibat mengganti Display Name!
                      </span>
                    </div>

                    {/* Domisili */}
                    <div className={styles.field}>
                      <label>
                        Domisili <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tuliskan Kota atau Kabupaten Kalian"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>

                    {/* Hobby */}
                    <div className={styles.field}>
                      <label>
                        Hobby <span>*</span>
                      </label>
                      <div className={styles.optionsGrid}>
                        {["Theateran", "Olahraga", "Editing dan Desain", "Main Game"].map((h) => (
                          <label key={h} className={styles.optionLabel}>
                            <input
                              type="checkbox"
                              checked={hobbies.includes(h)}
                              onChange={() => toggleHobby(h)}
                            />
                            <span>{h}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        className={styles.otherInput}
                        placeholder="Hobby yang lain (opsional)..."
                        value={hobbyOther}
                        onChange={(e) => setHobbyOther(e.target.value)}
                      />
                    </div>

                    {/* Media Sosial Notice */}
                    <div className={styles.field}>
                      <span className={styles.fieldSubtext} style={{ color: "var(--gold, #b45309)", fontWeight: 600 }}>
                        Silakan isi minimal satu akun media sosial yang aktif. Untuk keperluan pengecekan, mohon agar akun tidak di-private sementara waktu hingga proses pendaftaran selesai.
                      </span>
                    </div>

                    <div className={styles.field}>
                      <label>
                        Username X (Twitter) <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: @CavalleryID"
                        value={usernameX}
                        onChange={(e) => setUsernameX(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>
                        Username Instagram <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: @CavalleryID"
                        value={usernameIg}
                        onChange={(e) => setUsernameIg(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>
                        Username TikTok <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: @CavalleryID"
                        value={usernameTiktok}
                        onChange={(e) => setUsernameTiktok(e.target.value)}
                      />
                    </div>

                    {/* ALASAN MASUK CAVALLERY */}
                    <div className={styles.sectionDivider}>
                      <div className={styles.sectionHeading}>
                        <i className="bx bx-heart" /> Alasan & Kontribusi
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label>
                        Alasan kamu masuk Cavallery <span>*</span>
                      </label>
                      <div className={styles.optionsGrid}>
                        {[
                          "Aku Erine Oshi banget",
                          "Erine Cantik Banget",
                          "Aku Bangga sama Erine",
                          "Yang lain",
                        ].map((rOpt) => (
                          <label key={rOpt} className={styles.optionLabel}>
                            <input
                              type="radio"
                              name="reasonMember"
                              value={rOpt}
                              checked={reasonMember === rOpt}
                              onChange={(e) => setReasonMember(e.target.value)}
                            />
                            <span>{rOpt}</span>
                          </label>
                        ))}
                      </div>
                      {reasonMember === "Yang lain" && (
                        <input
                          type="text"
                          className={styles.otherInput}
                          placeholder="Tuliskan alasan lainnya..."
                          value={reasonMemberOther}
                          onChange={(e) => setReasonMemberOther(e.target.value)}
                        />
                      )}
                    </div>

                    <div className={styles.field}>
                      <label>
                        Bentuk support apa yang akan kamu berikan kepada Cavallery <span>*</span>
                      </label>
                      <span className={styles.fieldSubtext}>
                        Silahkan tuliskan keahlian kalian dalam bentuk apa saja!
                      </span>
                      <div className={styles.optionsGrid}>
                        {[
                          "Aku akan aktif interaksi di grup",
                          "Aku bisa ikut brainstorming dan aktif dalam project cavallery",
                          "Aku kalo verif bakal absen di grup min biar theateran bareng",
                          "Aku bisa desain dan editing",
                        ].map((sOpt) => (
                          <label key={sOpt} className={styles.optionLabel}>
                            <input
                              type="checkbox"
                              checked={supportTypes.includes(sOpt)}
                              onChange={() => toggleSupportType(sOpt)}
                            />
                            <span>{sOpt}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        className={styles.otherInput}
                        placeholder="Keahlian / bentuk support yang lain..."
                        value={supportTypeOther}
                        onChange={(e) => setSupportTypeOther(e.target.value)}
                      />
                    </div>

                    {/* SARAN KEGIATAN CAVALLERY */}
                    <div className={styles.field}>
                      <label>
                        Saran Kegiatan yang harus dilakukan oleh Cavallery
                      </label>
                      <span className={styles.fieldSubtext}>
                        Punya ide event, project, atau kegiatan seru untuk Cavallery? Tuliskan saranmu di sini!
                      </span>
                      <textarea
                        placeholder="Tuliskan saran kegiatan atau ide project untuk Cavallery..."
                        value={activitySuggestion}
                        onChange={(e) => setActivitySuggestion(e.target.value)}
                      />
                    </div>

                    {/* REMINDER */}
                    <div className={styles.reminderBox}>
                      <i className="bx bx-info-circle" />
                      <div>
                        <div className={styles.reminderTitle}>-REMINDER-</div>
                        <div className={styles.reminderText}>
                          Data kalian akan dikumpulkan dan di-screening oleh admin kami untuk proses pemeriksaan sebelum kalian bergabung dengan Cavallery.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ─── ADMIN & VOLUNTEER FORM ─── */
                  <>
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
                  </>
                )}

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

