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
      "6 Divisi: Video Editor, Script Writer, Sosmed, Voice Over, Admin & Editor Esport",
      "Pengalaman manajemen organisasi fanbase profesional",
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

const ADMIN_POSITIONS = [
  {
    id: "video_editor",
    title: "Video Editor",
    iconClass: "bx-video",
    desc: "Editing video kreatif, reels, tiktok, & highlight Erine",
  },
  {
    id: "script_writer",
    title: "Script Writer",
    iconClass: "bx-edit",
    desc: "Penulisan naskah, konsep konten, & storytelling project",
  },
  {
    id: "social_media",
    title: "Social Media",
    iconClass: "bx-share-alt",
    desc: "Pengelolaan konten & strategi publikasi di X, IG, TikTok, Discord",
  },
  {
    id: "voice_over",
    title: "Voice Over Konten",
    iconClass: "bx-microphone",
    desc: "Pengisi suara untuk konten video, narasi, & teaser",
  },
  {
    id: "admin_esport",
    title: "Admin Esport",
    iconClass: "bx-game",
    desc: "Koordinasi tim gaming, turnamen, & jadwal match esport",
  },
  {
    id: "editor_esport",
    title: "Editor Esport",
    iconClass: "bx-desktop",
    desc: "Editing highlight pertandingan & konten gaming Cavallery",
  },
];

export default function JoinPage() {
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalRole, setActiveModalRole] = useState<string | null>(null);

  // Common Form states (for volunteer)
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [division, setDivision] = useState("");
  const [reason, setReason] = useState("");

  // Member Registration Form specific states (1-Page Form)
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

  // ─── ADMIN RECRUITMENT MULTI-STEP STATES ──────────────────────
  const [adminStep, setAdminStep] = useState<1 | 2 | 3>(1);
  // Step 1: Data Diri
  const [adminFullName, setAdminFullName] = useState("");
  const [adminSocials, setAdminSocials] = useState("");
  const [adminCity, setAdminCity] = useState("");
  const [adminLineId, setAdminLineId] = useState("");
  const [adminOccupation, setAdminOccupation] = useState("");
  const [adminPosition, setAdminPosition] = useState("video_editor");

  // Step 2: Role-Specific Questions
  // 1. Video Editor
  const [veFamiliarity, setVeFamiliarity] = useState("Basic");
  const [veSoftware, setVeSoftware] = useState<string[]>(["CapCut"]);
  const [veSoftwareOther, setVeSoftwareOther] = useState("");
  const [veContentType, setVeContentType] = useState<string[]>([
    "Short video / Reels / TikTok",
  ]);
  const [veContentTypeOther, setVeContentTypeOther] = useState("");
  const [veBriefComfort, setVeBriefComfort] = useState("Ya");
  const [vePortfolio, setVePortfolio] = useState("");

  // 2. Script Writer
  const [swFrequency, setSwFrequency] = useState("Sesekali");
  const [swTypes, setSwTypes] = useState<string[]>(["Script video"]);
  const [swQuality, setSwQuality] = useState("");
  const [swPortfolio, setSwPortfolio] = useState("");

  // 3. Social Media
  const [smPlatforms, setSmPlatforms] = useState<string[]>([
    "Instagram",
    "TikTok",
  ]);
  const [smPlatformsOther, setSmPlatformsOther] = useState("");
  const [smFamiliarity, setSmFamiliarity] = useState("Cukup familiar");
  const [smCaptionTime, setSmCaptionTime] = useState("Ya");

  // 4. Voice Over
  const [voComfort, setVoComfort] = useState("Sangat nyaman");
  const [voCharacter, setVoCharacter] = useState<string[]>(["Ceria"]);
  const [voExperience, setVoExperience] = useState("Pernah");
  const [voIntonationAdapt, setVoIntonationAdapt] = useState("Ya");
  const [voSampleLink, setVoSampleLink] = useState("");

  // 5. Admin Esport
  const [aeFamiliarity, setAeFamiliarity] = useState("Cukup mengikuti");
  const [aeFavoriteGames, setAeFavoriteGames] = useState("");
  const [aeExperience, setAeExperience] = useState("Pernah");
  const [aeCommunicationComfort, setAeCommunicationComfort] =
    useState("Sangat nyaman");

  // 6. Editor Esport
  const [eeFamiliarity, setEeFamiliarity] = useState("Cukup terbiasa");
  const [eeContentTypes, setEeContentTypes] = useState<string[]>(["Highlight"]);
  const [eeContentTypesOther, setEeContentTypesOther] = useState("");
  const [eeSoftware, setEeSoftware] = useState<string[]>(["CapCut"]);
  const [eeSoftwareOther, setEeSoftwareOther] = useState("");
  const [eeLongVideoStrategy, setEeLongVideoStrategy] = useState("");
  const [eePortfolio, setEePortfolio] = useState("");

  // Step 3: Komitmen
  const [commitmentTeamwork, setCommitmentTeamwork] = useState("Tentu");
  const [commitmentReason, setCommitmentReason] = useState("");
  const [commitmentSelectionReady, setCommitmentSelectionReady] =
    useState("Ya");

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
    setAdminStep(1);
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

    // Reset Admin fields
    setAdminFullName("");
    setAdminSocials("");
    setAdminCity("");
    setAdminLineId("");
    setAdminOccupation("");
    setAdminPosition("video_editor");
    setVeFamiliarity("Basic");
    setVeSoftware(["CapCut"]);
    setVeSoftwareOther("");
    setVeContentType(["Short video / Reels / TikTok"]);
    setVeContentTypeOther("");
    setVeBriefComfort("Ya");
    setVePortfolio("");
    setSwFrequency("Sesekali");
    setSwTypes(["Script video"]);
    setSwQuality("");
    setSwPortfolio("");
    setSmPlatforms(["Instagram", "TikTok"]);
    setSmPlatformsOther("");
    setSmFamiliarity("Cukup familiar");
    setSmCaptionTime("Ya");
    setVoComfort("Sangat nyaman");
    setVoCharacter(["Ceria"]);
    setVoExperience("Pernah");
    setVoIntonationAdapt("Ya");
    setVoSampleLink("");
    setAeFamiliarity("Cukup mengikuti");
    setAeFavoriteGames("");
    setAeExperience("Pernah");
    setAeCommunicationComfort("Sangat nyaman");
    setEeFamiliarity("Cukup terbiasa");
    setEeContentTypes(["Highlight"]);
    setEeContentTypesOther("");
    setEeSoftware(["CapCut"]);
    setEeSoftwareOther("");
    setEeLongVideoStrategy("");
    setEePortfolio("");
    setCommitmentTeamwork("Tentu");
    setCommitmentReason("");
    setCommitmentSelectionReady("Ya");

    setFormError("");
    setSubmitted(false);
  };

  const closeModal = () => {
    setActiveModalRole(null);
    setSubmitted(false);
  };

  const toggleArrayItem = (
    list: string[],
    item: string,
    setter: (val: string[]) => void,
  ) => {
    setter(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  };

  const toggleHobby = (h: string) => toggleArrayItem(hobbies, h, setHobbies);
  const toggleSupportType = (s: string) =>
    toggleArrayItem(supportTypes, s, setSupportTypes);

  // Admin Step 1 Validation
  const handleAdminStep1Next = () => {
    setFormError("");
    if (!adminFullName.trim()) {
      setFormError("Mohon isi Nama / Nama Panggilan kamu.");
      return;
    }
    if (!adminSocials.trim()) {
      setFormError("Mohon isi Username Instagram / X / Discord kamu.");
      return;
    }
    if (!adminCity.trim()) {
      setFormError("Mohon isi Kota Domisili kamu.");
      return;
    }
    if (!adminLineId.trim()) {
      setFormError("Mohon isi ID Line kamu.");
      return;
    }
    if (!adminOccupation.trim()) {
      setFormError("Mohon isi Kesibukan saat ini.");
      return;
    }
    if (!adminPosition) {
      setFormError("Mohon pilih salah satu posisi yang ingin kamu ambil.");
      return;
    }
    setAdminStep(2);
  };

  // Admin Step 2 Validation
  const handleAdminStep2Next = () => {
    setFormError("");
    if (adminPosition === "video_editor") {
      if (veSoftware.length === 0 && !veSoftwareOther.trim()) {
        setFormError(
          "Mohon pilih minimal satu aplikasi editing yang biasa digunakan.",
        );
        return;
      }
      if (veContentType.length === 0 && !veContentTypeOther.trim()) {
        setFormError("Mohon pilih jenis konten yang biasa kamu edit.");
        return;
      }
    } else if (adminPosition === "script_writer") {
      if (swTypes.length === 0) {
        setFormError("Mohon pilih minimal satu jenis tulisan yang disukai.");
        return;
      }
      if (!swQuality.trim()) {
        setFormError("Mohon jawab apa yang membuat sebuah script menarik.");
        return;
      }
    } else if (adminPosition === "social_media") {
      if (smPlatforms.length === 0 && !smPlatformsOther.trim()) {
        setFormError("Mohon pilih platform yang paling kamu pahami.");
        return;
      }
    } else if (adminPosition === "voice_over") {
      if (voCharacter.length === 0) {
        setFormError("Mohon pilih karakter suara yang paling sesuai.");
        return;
      }
    } else if (adminPosition === "admin_esport") {
      if (!aeFavoriteGames.trim()) {
        setFormError(
          "Mohon tuliskan game/esport yang paling sering kamu ikuti.",
        );
        return;
      }
    } else if (adminPosition === "editor_esport") {
      if (eeContentTypes.length === 0 && !eeContentTypesOther.trim()) {
        setFormError("Mohon pilih jenis konten esport yang suka diedit.");
        return;
      }
      if (eeSoftware.length === 0 && !eeSoftwareOther.trim()) {
        setFormError("Mohon pilih software editing yang digunakan.");
        return;
      }
      if (!eeLongVideoStrategy.trim()) {
        setFormError(
          "Mohon jawab penentuan bagian rekaman pertandingan untuk highlight.",
        );
        return;
      }
    }
    setAdminStep(3);
  };

  const getPositionTitle = (id: string) => {
    const pos = ADMIN_POSITIONS.find((p) => p.id === id);
    return pos ? pos.title : id;
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
        setFormError(
          "Anda wajib menyetujui ketentuan iuran Rp75.000 untuk melanjutkan pendaftaran.",
        );
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
        setFormError(
          "Mohon isi minimal satu akun media sosial aktif (X, Instagram, atau TikTok).",
        );
        return;
      }
      if (supportTypes.length === 0 && !supportTypeOther.trim()) {
        setFormError("Mohon pilih bentuk support yang akan Anda berikan.");
        return;
      }
    } else if (activeModalRole === "admin") {
      if (!commitmentReason.trim()) {
        setFormError(
          "Mohon isi alasan kamu tertarik bergabung sebagai admin Cavallery.",
        );
        return;
      }
    } else {
      if (!fullName.trim() || !city.trim() || !whatsapp.trim()) {
        setFormError(
          "Mohon lengkapi data wajib (Nama Lengkap, Kota, dan No. WhatsApp).",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      let payload: any = {};

      if (activeModalRole === "member") {
        const finalHobbyList = [...hobbies];
        if (hobbyOther.trim()) finalHobbyList.push(hobbyOther.trim());

        const finalSupportList = [...supportTypes];
        if (supportTypeOther.trim())
          finalSupportList.push(supportTypeOther.trim());

        const chosenReason =
          reasonMember === "Yang lain" && reasonMemberOther.trim()
            ? reasonMemberOther.trim()
            : reasonMember;

        const chosenSource =
          infoSource === "Yang lain" && infoSourceOther.trim()
            ? infoSourceOther.trim()
            : infoSource;

        payload = {
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
        };
      } else if (activeModalRole === "admin") {
        // Collect role-specific answers
        let roleAnswers: any = {};
        if (adminPosition === "video_editor") {
          roleAnswers = {
            familiarity: veFamiliarity,
            software: [
              ...veSoftware,
              ...(veSoftwareOther.trim() ? [veSoftwareOther.trim()] : []),
            ],
            content_type: [
              ...veContentType,
              ...(veContentTypeOther.trim() ? [veContentTypeOther.trim()] : []),
            ],
            brief_comfort: veBriefComfort,
            portfolio: vePortfolio.trim() || "-",
          };
        } else if (adminPosition === "script_writer") {
          roleAnswers = {
            frequency: swFrequency,
            types: swTypes,
            script_quality_insight: swQuality.trim(),
            portfolio: swPortfolio.trim() || "-",
          };
        } else if (adminPosition === "social_media") {
          roleAnswers = {
            platforms: [
              ...smPlatforms,
              ...(smPlatformsOther.trim() ? [smPlatformsOther.trim()] : []),
            ],
            familiarity: smFamiliarity,
            caption_and_timing: smCaptionTime,
          };
        } else if (adminPosition === "voice_over") {
          roleAnswers = {
            voice_comfort: voComfort,
            voice_character: voCharacter,
            experience: voExperience,
            intonation_adapt: voIntonationAdapt,
            sample_link: voSampleLink.trim() || "-",
          };
        } else if (adminPosition === "admin_esport") {
          roleAnswers = {
            familiarity: aeFamiliarity,
            favorite_games: aeFavoriteGames.trim(),
            experience: aeExperience,
            communication_comfort: aeCommunicationComfort,
          };
        } else if (adminPosition === "editor_esport") {
          roleAnswers = {
            familiarity: eeFamiliarity,
            content_types: [
              ...eeContentTypes,
              ...(eeContentTypesOther.trim()
                ? [eeContentTypesOther.trim()]
                : []),
            ],
            software: [
              ...eeSoftware,
              ...(eeSoftwareOther.trim() ? [eeSoftwareOther.trim()] : []),
            ],
            long_video_strategy: eeLongVideoStrategy.trim(),
            portfolio: eePortfolio.trim() || "-",
          };
        }

        payload = {
          role_id: "admin",
          full_name: adminFullName.trim(),
          nickname: adminFullName.trim(),
          city: adminCity.trim(),
          whatsapp: adminLineId.trim(),
          line_id: adminLineId.trim(),
          social_media: adminSocials.trim(),
          division: getPositionTitle(adminPosition),
          reason: commitmentReason.trim(),
          support_type: null,
          activity_suggestion: `Bekerja Tim: ${commitmentTeamwork} | Siap Briefing: ${commitmentSelectionReady} | Kesibukan: ${adminOccupation}`,
          extra_data: {
            step1: {
              full_name: adminFullName.trim(),
              socials: adminSocials.trim(),
              city: adminCity.trim(),
              line_id: adminLineId.trim(),
              occupation: adminOccupation.trim(),
              position: adminPosition,
              position_title: getPositionTitle(adminPosition),
            },
            role_specific_answers: roleAnswers,
            step3_commitment: {
              teamwork_and_feedback: commitmentTeamwork,
              interest_reason: commitmentReason.trim(),
              selection_briefing_ready: commitmentSelectionReady,
            },
          },
        };
      } else {
        payload = {
          role_id: activeModalRole,
          full_name: fullName.trim(),
          nickname: nickname.trim() || null,
          city: city.trim(),
          whatsapp: whatsapp.trim(),
          social_media: socialMedia.trim() || null,
          division: division.trim() || null,
          reason: reason.trim() || null,
        };
      }

      const res = await fetch("/api/recruitment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted(true);
      } else {
        setFormError(
          json.message || "Gagal mengirim pendaftaran. Silakan coba lagi.",
        );
      }
    } catch {
      setFormError(
        "Terjadi kendala jaringan. Silakan coba kembali beberapa saat lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentRoleConfig = roles.find((r) => r.id === activeModalRole);
  const currentRoleInfo = activeModalRole ? ROLES_INFO[activeModalRole] : null;

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge">
            <i className="fa-solid fa-chess-knight" /> Official Fanbase
            Recruitment
          </div>
          <h1 className={styles.heroTitle}>
            Bergabung Bersama Komunitas{" "}
            <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroSub}>
            Tentukan peranmu dalam mendukung, merayakan, dan berbagi keceriaan
            bersama Erine JKT48.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <i className="bx bx-loader-alt bx-spin" />
            <p>Memuat informasi recruitment...</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {roles.map((role) => {
              const info = ROLES_INFO[role.id] || {
                icon: "bx-user",
                iconBg: "rgba(180, 83, 9, 0.1)",
                color: "#b45309",
                perks: [],
              };
              const isOpen = Boolean(role.is_open);

              return (
                <div key={role.id} className={styles.roleCard}>
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.iconCircle}
                      style={{ background: info.iconBg, color: info.color }}
                    >
                      <i className={`bx ${info.icon}`} />
                    </div>
                    <div className={styles.statusBadgeWrap}>
                      {isOpen ? (
                        <span className={styles.badgeOpen}>
                          <span className={styles.pulseDot} /> Dibuka
                        </span>
                      ) : (
                        <span className={styles.badgeClosed}>Ditutup</span>
                      )}
                    </div>
                  </div>

                  <h3 className={styles.roleTitle}>{role.title}</h3>
                  <p className={styles.roleDesc}>{role.description}</p>

                  <div className={styles.perksList}>
                    <div className={styles.perksHeading}>
                      Keuntungan / Benefit:
                    </div>
                    {info.perks.map((perk, idx) => (
                      <div key={idx} className={styles.perkItem}>
                        <i className="bx bx-check" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`${styles.applyBtn} ${!isOpen ? styles.btnDisabled : ""}`}
                    disabled={!isOpen}
                    onClick={() => openForm(role.id)}
                  >
                    {isOpen ? (
                      <>
                        Daftar {role.title}{" "}
                        <i className="bx bx-right-arrow-alt" />
                      </>
                    ) : (
                      "Pendaftaran Ditutup"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL REKRUTMEN ─── */}
      {activeModalRole && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={`${styles.modalContent} ${activeModalRole === "admin" ? styles.modalContentWide : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={closeModal}
              aria-label="Close modal"
            >
              <i className="bx bx-x" />
            </button>

            <div className={styles.modalHeader}>
              <div
                className={styles.modalIconCircle}
                style={{
                  background: currentRoleInfo?.iconBg,
                  color: currentRoleInfo?.color,
                }}
              >
                <i className={`bx ${currentRoleInfo?.icon}`} />
              </div>
              <div>
                <h2 className={styles.modalTitle}>
                  Formulir Pendaftaran {currentRoleConfig?.title}
                </h2>
                <p className={styles.modalSub}>
                  {activeModalRole === "admin"
                    ? "Open Recruitment Admin & Pengurus Fanbase Cavallery"
                    : activeModalRole === "member"
                      ? "Formulir Pendaftaran Anggota Resmi Cavallery"
                      : "Lengkapi data diri kamu di bawah ini dengan benar."}
                </p>
              </div>
            </div>

            {submitted ? (
              <div className={styles.successBox}>
                <i className={`bx bx-check-circle ${styles.successIcon}`} />
                <h3 className={styles.successTitle}>
                  Pendaftaran Berhasil Dikirim!
                </h3>
                <p className={styles.successDesc}>
                  {activeModalRole === "admin"
                    ? "Terima kasih sudah meluangkan waktu untuk mengisi Open Recruitment Admin Cavallery. Tim kami akan memeriksa data kamu dan menghubungi via kontak yang diberikan untuk tahap selanjutnya."
                    : activeModalRole === "member"
                      ? "Terima kasih telah mendaftar sebagai anggota resmi Cavallery! Data kamu akan diverifikasi oleh admin, dan info pembayaran iuran (QRIS) akan dikirimkan ke kontak kamu."
                      : "Terima kasih! Data pendaftaran kamu sudah kami terima dan akan segera diproses oleh tim Cavallery."}
                </p>
                <button className={styles.submitBtn} onClick={closeModal}>
                  Selesai
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

                {/* ══════════════════════════════════════════════════════
                    1. FORM REKRUTMEN ADMIN (MULTI-STEP WIZARD)
                    ══════════════════════════════════════════════════════ */}
                {activeModalRole === "admin" ? (
                  <>
                    {/* Stepper Progress */}
                    <div className={styles.stepperContainer}>
                      <div className={styles.stepperBar}>
                        <div
                          className={`${styles.stepperStep} ${adminStep >= 1 ? styles.stepperStepActive : ""} ${adminStep > 1 ? styles.stepperStepDone : ""}`}
                        >
                          <div className={styles.stepperNumber}>
                            {adminStep > 1 ? "✓" : "1"}
                          </div>
                          <span className={styles.stepperLabel}>Data Diri</span>
                        </div>
                        <div className={styles.stepperDivider} />
                        <div
                          className={`${styles.stepperStep} ${adminStep >= 2 ? styles.stepperStepActive : ""} ${adminStep > 2 ? styles.stepperStepDone : ""}`}
                        >
                          <div className={styles.stepperNumber}>
                            {adminStep > 2 ? "✓" : "2"}
                          </div>
                          <span className={styles.stepperLabel}>
                            Pertanyaan Posisi
                          </span>
                        </div>
                        <div className={styles.stepperDivider} />
                        <div
                          className={`${styles.stepperStep} ${adminStep === 3 ? styles.stepperStepActive : ""}`}
                        >
                          <div className={styles.stepperNumber}>3</div>
                          <span className={styles.stepperLabel}>Komitmen</span>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 1: DATA DIRI & PILIH POSISI ── */}
                    {adminStep === 1 && (
                      <>
                        <div className={styles.sectionHeading}>
                          <i className="bx bx-user" /> SECTION 1 — Data Diri &
                          Posisi
                        </div>

                        <div className={styles.field}>
                          <label>
                            1. Nama / Nama Panggilan <span>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Tuliskan nama atau nama panggilan kamu"
                            value={adminFullName}
                            onChange={(e) => setAdminFullName(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label>
                            2. Username Instagram / X / Discord <span>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: @username (IG/X) atau username#0000 (Discord)"
                            value={adminSocials}
                            onChange={(e) => setAdminSocials(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label>
                            3. Domisili <span>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Jakarta / Surabaya / Bandung"
                            value={adminCity}
                            onChange={(e) => setAdminCity(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label>
                            4. ID Line <span>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Tuliskan ID Line aktif kamu"
                            value={adminLineId}
                            onChange={(e) => setAdminLineId(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label>
                            5. Kesibukan saat ini <span>*</span>
                          </label>
                          <span className={styles.fieldSubtext}>
                            Tuliskan aktivitas atau kesibukan utama kamu saat
                            ini.
                          </span>
                          <input
                            type="text"
                            placeholder="Tuliskan kesibukan kamu saat ini"
                            value={adminOccupation}
                            onChange={(e) => setAdminOccupation(e.target.value)}
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label>
                            6. Pilih posisi yang ingin kamu ambil <span>*</span>
                          </label>
                          <span className={styles.fieldSubtext}>
                            Pertanyaan di langkah berikutnya akan disesuaikan
                            dengan posisi yang kamu pilih.
                          </span>

                          <div className={styles.positionGrid}>
                            {ADMIN_POSITIONS.map((pos) => (
                              <div
                                key={pos.id}
                                className={`${styles.positionCard} ${adminPosition === pos.id ? styles.positionCardActive : ""}`}
                                onClick={() => setAdminPosition(pos.id)}
                              >
                                <span className={styles.positionIcon}>
                                  <i className={`bx ${pos.iconClass}`} />
                                </span>
                                <div className={styles.positionInfo}>
                                  <span className={styles.positionTitle}>
                                    {pos.title}
                                  </span>
                                  <span className={styles.positionSub}>
                                    {pos.desc}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.stepNavButtons}>
                          <button
                            type="button"
                            className={styles.nextBtn}
                            onClick={handleAdminStep1Next}
                          >
                            Lanjut ke Pertanyaan Posisi{" "}
                            <i className="bx bx-right-arrow-alt" />
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── STEP 2: DYNAMIC ROLE-SPECIFIC QUESTIONS ── */}
                    {adminStep === 2 && (
                      <>
                        {/* 1. VIDEO EDITOR */}
                        {adminPosition === "video_editor" && (
                          <>
                            <div className={styles.sectionHeading}>
                              <i className="bx bx-video" /> SECTION — VIDEO
                              EDITOR
                            </div>

                            <div className={styles.field}>
                              <label>
                                1. Seberapa familiar kamu dengan video editing?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Baru ingin belajar",
                                  "Basic",
                                  "Cukup terbiasa",
                                  "Mahir",
                                ].map((opt) => (
                                  <label
                                    key={opt}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="veFamiliarity"
                                      value={opt}
                                      checked={veFamiliarity === opt}
                                      onChange={(e) =>
                                        setVeFamiliarity(e.target.value)
                                      }
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                2. Aplikasi editing yang biasa kamu gunakan?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "CapCut",
                                  "Adobe Premiere Pro",
                                  "After Effects",
                                  "Alight Motion",
                                ].map((sw) => (
                                  <label
                                    key={sw}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={veSoftware.includes(sw)}
                                      onChange={() =>
                                        toggleArrayItem(
                                          veSoftware,
                                          sw,
                                          setVeSoftware,
                                        )
                                      }
                                    />
                                    <span>{sw}</span>
                                  </label>
                                ))}
                              </div>
                              <input
                                type="text"
                                className={styles.otherInput}
                                placeholder="Aplikasi lainnya..."
                                value={veSoftwareOther}
                                onChange={(e) =>
                                  setVeSoftwareOther(e.target.value)
                                }
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                3. Biasanya kamu lebih suka mengedit konten
                                seperti apa? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Short video / Reels / TikTok",
                                  "Clip Theater",
                                  "Clip Live Erine",
                                  "Video storytelling",
                                ].map((ct) => (
                                  <label
                                    key={ct}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={veContentType.includes(ct)}
                                      onChange={() =>
                                        toggleArrayItem(
                                          veContentType,
                                          ct,
                                          setVeContentType,
                                        )
                                      }
                                    />
                                    <span>{ct}</span>
                                  </label>
                                ))}
                              </div>
                              <input
                                type="text"
                                className={styles.otherInput}
                                placeholder="Jenis konten lainnya..."
                                value={veContentTypeOther}
                                onChange={(e) =>
                                  setVeContentTypeOther(e.target.value)
                                }
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                4. Jika ada brief sederhana, apakah kamu nyaman
                                mengembangkan konsep editing sendiri?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Ya",
                                  "Bisa, tetapi masih perlu arahan",
                                  "Lebih nyaman jika diberikan contoh",
                                ].map((bc) => (
                                  <label
                                    key={bc}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="veBriefComfort"
                                      value={bc}
                                      checked={veBriefComfort === bc}
                                      onChange={(e) =>
                                        setVeBriefComfort(e.target.value)
                                      }
                                    />
                                    <span>{bc}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                5. Portfolio / contoh edit (jika ada)
                              </label>
                              <span className={styles.fieldSubtext}>
                                Masukkan link Google Drive, TikTok, YouTube,
                                atau platform portofolio kamu.
                              </span>
                              <input
                                type="text"
                                placeholder="Contoh link: drive.google.com/... atau tiktok.com/@..."
                                value={vePortfolio}
                                onChange={(e) => setVePortfolio(e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {/* 2. SCRIPT WRITER */}
                        {adminPosition === "script_writer" && (
                          <>
                            <div className={styles.sectionHeading}>
                              <i className="bx bx-edit" /> SECTION — SCRIPT
                              WRITER
                            </div>

                            <div className={styles.field}>
                              <label>
                                1. Seberapa sering kamu menulis untuk konten?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Belum pernah",
                                  "Sesekali",
                                  "Cukup sering",
                                  "Sering",
                                ].map((freq) => (
                                  <label
                                    key={freq}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="swFrequency"
                                      value={freq}
                                      checked={swFrequency === freq}
                                      onChange={(e) =>
                                        setSwFrequency(e.target.value)
                                      }
                                    />
                                    <span>{freq}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                2. Jenis tulisan yang paling kamu suka?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Caption",
                                  "Script video",
                                  "Storytelling",
                                  "Informasi / edukasi",
                                  "Entertainment",
                                  "Esport / gaming",
                                ].map((tp) => (
                                  <label
                                    key={tp}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={swTypes.includes(tp)}
                                      onChange={() =>
                                        toggleArrayItem(swTypes, tp, setSwTypes)
                                      }
                                    />
                                    <span>{tp}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                3. Menurutmu, apa yang membuat sebuah script
                                menarik untuk dibaca atau ditonton?{" "}
                                <span>*</span>
                              </label>
                              <textarea
                                placeholder="Tuliskan pandanganmu mengenai daya tarik sebuah naskah/script..."
                                value={swQuality}
                                onChange={(e) => setSwQuality(e.target.value)}
                                required
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                4. Portfolio / contoh hasil tulisan untuk
                                melihat gaya penulisan kamu (jika ada)
                              </label>
                              <input
                                type="text"
                                placeholder="Link Google Docs / Medium / Thread X / file portfolio"
                                value={swPortfolio}
                                onChange={(e) => setSwPortfolio(e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {/* 3. SOCIAL MEDIA */}
                        {adminPosition === "social_media" && (
                          <>
                            <div className={styles.sectionHeading}>
                              <i className="bx bx-share-alt" /> SECTION — SOCIAL
                              MEDIA
                            </div>

                            <div className={styles.field}>
                              <label>
                                1. Platform yang paling kamu pahami?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {["Instagram", "TikTok", "X"].map((pf) => (
                                  <label
                                    key={pf}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={smPlatforms.includes(pf)}
                                      onChange={() =>
                                        toggleArrayItem(
                                          smPlatforms,
                                          pf,
                                          setSmPlatforms,
                                        )
                                      }
                                    />
                                    <span>{pf}</span>
                                  </label>
                                ))}
                              </div>
                              <input
                                type="text"
                                className={styles.otherInput}
                                placeholder="Platform lainnya..."
                                value={smPlatformsOther}
                                onChange={(e) =>
                                  setSmPlatformsOther(e.target.value)
                                }
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                2. Seberapa familiar kamu dengan membuat dan
                                mengelola konten sosial media? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Baru ingin belajar",
                                  "Basic",
                                  "Cukup familiar",
                                  "Sangat familiar",
                                ].map((fam) => (
                                  <label
                                    key={fam}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="smFamiliarity"
                                      value={fam}
                                      checked={smFamiliarity === fam}
                                      onChange={(e) =>
                                        setSmFamiliarity(e.target.value)
                                      }
                                    />
                                    <span>{fam}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                3. Apakah kamu nyaman membuat caption sederhana
                                dan menentukan waktu posting? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {["Ya", "Bisa belajar", "Belum yakin"].map(
                                  (ct) => (
                                    <label
                                      key={ct}
                                      className={styles.optionLabel}
                                    >
                                      <input
                                        type="radio"
                                        name="smCaptionTime"
                                        value={ct}
                                        checked={smCaptionTime === ct}
                                        onChange={(e) =>
                                          setSmCaptionTime(e.target.value)
                                        }
                                      />
                                      <span>{ct}</span>
                                    </label>
                                  ),
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* 4. VOICE OVER KONTEN */}
                        {adminPosition === "voice_over" && (
                          <>
                            <div className={styles.sectionHeading}>
                              <i className="bx bx-microphone" /> SECTION — VOICE
                              OVER KONTEN
                            </div>

                            <div className={styles.field}>
                              <label>
                                1. Apakah kamu nyaman menggunakan suara sendiri
                                untuk konten? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Sangat nyaman",
                                  "Cukup nyaman",
                                  "Masih sedikit malu",
                                  "Ingin mencoba",
                                ].map((comf) => (
                                  <label
                                    key={comf}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="voComfort"
                                      value={comf}
                                      checked={voComfort === comf}
                                      onChange={(e) =>
                                        setVoComfort(e.target.value)
                                      }
                                    />
                                    <span>{comf}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                2. Karakter suara yang paling sesuai denganmu?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Ceria",
                                  "Calm / tenang",
                                  "Enerjik",
                                  "Storytelling",
                                  "Formal",
                                  "Bisa menyesuaikan",
                                ].map((chr) => (
                                  <label
                                    key={chr}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={voCharacter.includes(chr)}
                                      onChange={() =>
                                        toggleArrayItem(
                                          voCharacter,
                                          chr,
                                          setVoCharacter,
                                        )
                                      }
                                    />
                                    <span>{chr}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                3. Pernah melakukan voice over sebelumnya?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {["Pernah", "Belum pernah"].map((exp) => (
                                  <label
                                    key={exp}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="voExperience"
                                      value={exp}
                                      checked={voExperience === exp}
                                      onChange={(e) =>
                                        setVoExperience(e.target.value)
                                      }
                                    />
                                    <span>{exp}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                4. Jika diberikan script, apakah kamu nyaman
                                menyesuaikan intonasi dengan mood konten?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Ya",
                                  "Bisa dengan arahan",
                                  "Masih ingin belajar",
                                ].map((ia) => (
                                  <label
                                    key={ia}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="voIntonationAdapt"
                                      value={ia}
                                      checked={voIntonationAdapt === ia}
                                      onChange={(e) =>
                                        setVoIntonationAdapt(e.target.value)
                                      }
                                    />
                                    <span>{ia}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                5. Upload / Link contoh voice over (opsional)
                              </label>
                              <span className={styles.fieldSubtext}>
                                Bisa berupa rekaman 15–30 detik dengan topik
                                bebas (link Google Drive/Vocaroo).
                              </span>
                              <input
                                type="text"
                                placeholder="Contoh link: drive.google.com/... atau vocaroo.com/..."
                                value={voSampleLink}
                                onChange={(e) =>
                                  setVoSampleLink(e.target.value)
                                }
                              />
                            </div>
                          </>
                        )}

                        {/* 5. ADMIN ESPORT */}
                        {adminPosition === "admin_esport" && (
                          <>
                            <div className={styles.sectionHeading}>
                              <i className="bx bx-game" /> SECTION — ADMIN
                              ESPORT
                            </div>
                            <span
                              className={styles.fieldSubtext}
                              style={{ display: "block", marginBottom: "14px" }}
                            >
                              Fokus pada kedisiplinan, koordinasi tim, dan
                              pemahaman dasar dunia esport.
                            </span>

                            <div className={styles.field}>
                              <label>
                                1. Seberapa familiar kamu dengan dunia esport?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Tidak terlalu familiar",
                                  "Cukup mengikuti",
                                  "Sering mengikuti",
                                  "Sangat mengikuti",
                                ].map((fam) => (
                                  <label
                                    key={fam}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="aeFamiliarity"
                                      value={fam}
                                      checked={aeFamiliarity === fam}
                                      onChange={(e) =>
                                        setAeFamiliarity(e.target.value)
                                      }
                                    />
                                    <span>{fam}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                2. Game/esport apa yang paling sering kamu
                                ikuti? <span>*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: Mobile Legends, Clash of Clans, eFootball, PUBG, Valorant, dll."
                                value={aeFavoriteGames}
                                onChange={(e) =>
                                  setAeFavoriteGames(e.target.value)
                                }
                                required
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                3. Pernah menjadi admin/anggota organisasi atau
                                komunitas sebelumnya? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {["Pernah", "Belum pernah"].map((exp) => (
                                  <label
                                    key={exp}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="aeExperience"
                                      value={exp}
                                      checked={aeExperience === exp}
                                      onChange={(e) =>
                                        setAeExperience(e.target.value)
                                      }
                                    />
                                    <span>{exp}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                4. Seberapa nyaman kamu berkomunikasi dengan
                                anggota tim melalui Discord/LINE? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Sangat nyaman",
                                  "Cukup nyaman",
                                  "Bisa, tetapi masih perlu beradaptasi",
                                ].map((comf) => (
                                  <label
                                    key={comf}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="aeCommunicationComfort"
                                      value={comf}
                                      checked={aeCommunicationComfort === comf}
                                      onChange={(e) =>
                                        setAeCommunicationComfort(
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <span>{comf}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* 6. EDITOR ESPORT */}
                        {adminPosition === "editor_esport" && (
                          <>
                            <div className={styles.sectionHeading}>
                              <i className="bx bx-desktop" /> SECTION — EDITOR
                              ESPORT
                            </div>

                            <div className={styles.field}>
                              <label>
                                1. Seberapa familiar kamu dengan editing konten
                                gaming/esport? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Belum pernah",
                                  "Basic",
                                  "Cukup terbiasa",
                                  "Mahir",
                                ].map((fam) => (
                                  <label
                                    key={fam}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="radio"
                                      name="eeFamiliarity"
                                      value={fam}
                                      checked={eeFamiliarity === fam}
                                      onChange={(e) =>
                                        setEeFamiliarity(e.target.value)
                                      }
                                    />
                                    <span>{fam}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className={styles.field}>
                              <label>
                                2. Jenis konten esport yang paling kamu suka
                                edit? <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "Highlight",
                                  "Montage",
                                  "Short clip",
                                  "Match recap",
                                  "Meme / entertainment",
                                ].map((ct) => (
                                  <label
                                    key={ct}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={eeContentTypes.includes(ct)}
                                      onChange={() =>
                                        toggleArrayItem(
                                          eeContentTypes,
                                          ct,
                                          setEeContentTypes,
                                        )
                                      }
                                    />
                                    <span>{ct}</span>
                                  </label>
                                ))}
                              </div>
                              <input
                                type="text"
                                className={styles.otherInput}
                                placeholder="Jenis konten lainnya..."
                                value={eeContentTypesOther}
                                onChange={(e) =>
                                  setEeContentTypesOther(e.target.value)
                                }
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                3. Software editing yang biasa kamu gunakan?{" "}
                                <span>*</span>
                              </label>
                              <div className={styles.optionsGrid}>
                                {[
                                  "CapCut",
                                  "Premiere Pro",
                                  "After Effects",
                                ].map((sw) => (
                                  <label
                                    key={sw}
                                    className={styles.optionLabel}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={eeSoftware.includes(sw)}
                                      onChange={() =>
                                        toggleArrayItem(
                                          eeSoftware,
                                          sw,
                                          setEeSoftware,
                                        )
                                      }
                                    />
                                    <span>{sw}</span>
                                  </label>
                                ))}
                              </div>
                              <input
                                type="text"
                                className={styles.otherInput}
                                placeholder="Software lainnya..."
                                value={eeSoftwareOther}
                                onChange={(e) =>
                                  setEeSoftwareOther(e.target.value)
                                }
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                4. Jika diberikan rekaman pertandingan berdurasi
                                panjang, bagaimana kamu menentukan bagian yang
                                akan dijadikan highlight? <span>*</span>
                              </label>
                              <textarea
                                placeholder="Jelaskan alur kerjamu dalam menyaring momen clutch, kill streak, atau perayaan kemenangan..."
                                value={eeLongVideoStrategy}
                                onChange={(e) =>
                                  setEeLongVideoStrategy(e.target.value)
                                }
                                required
                              />
                            </div>

                            <div className={styles.field}>
                              <label>
                                5. Portfolio / contoh edit (jika ada)
                              </label>
                              <input
                                type="text"
                                placeholder="Link Google Drive / YouTube / TikTok portofolio kamu"
                                value={eePortfolio}
                                onChange={(e) => setEePortfolio(e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        <div className={styles.stepNavButtons}>
                          <button
                            type="button"
                            className={styles.prevBtn}
                            onClick={() => setAdminStep(1)}
                          >
                            <i className="bx bx-left-arrow-alt" /> Kembali
                          </button>
                          <button
                            type="button"
                            className={styles.nextBtn}
                            onClick={handleAdminStep2Next}
                          >
                            Lanjut ke Komitmen{" "}
                            <i className="bx bx-right-arrow-alt" />
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── STEP 3: KOMITMEN & SUBMIT ── */}
                    {adminStep === 3 && (
                      <>
                        <div className={styles.sectionHeading}>
                          <i className="bx bx-check-shield" /> SECTION TERAKHIR
                          — KOMITMEN
                        </div>

                        <div className={styles.field}>
                          <label>
                            1. Apakah kamu bersedia bekerja dalam tim dan
                            menerima feedback dari anggota lain? <span>*</span>
                          </label>
                          <div className={styles.optionsGrid}>
                            {["Ya", "Tentu"].map((tw) => (
                              <label key={tw} className={styles.optionLabel}>
                                <input
                                  type="radio"
                                  name="commitmentTeamwork"
                                  value={tw}
                                  checked={commitmentTeamwork === tw}
                                  onChange={(e) =>
                                    setCommitmentTeamwork(e.target.value)
                                  }
                                />
                                <span>{tw}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label>
                            2. Apa alasan kamu tertarik bergabung sebagai admin
                            Cavallery? <span>*</span>
                          </label>
                          <textarea
                            placeholder="Ceritakan motivasi dan semangat kamu bergabung dalam tim pengurus Cavallery..."
                            value={commitmentReason}
                            onChange={(e) =>
                              setCommitmentReason(e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className={styles.field}>
                          <label>
                            3. Apakah kamu bersedia mengikuti proses seleksi dan
                            briefing apabila lolos? <span>*</span>
                          </label>
                          <div className={styles.optionsGrid}>
                            {["Ya", "Tidak"].map((br) => (
                              <label key={br} className={styles.optionLabel}>
                                <input
                                  type="radio"
                                  name="commitmentSelectionReady"
                                  value={br}
                                  checked={commitmentSelectionReady === br}
                                  onChange={(e) =>
                                    setCommitmentSelectionReady(e.target.value)
                                  }
                                />
                                <span>{br}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className={styles.closingBox}>
                          <i
                            className={`bx bx-compass ${styles.closingIcon}`}
                          />
                          <div>
                            <div className={styles.closingTitle}>
                              Terima kasih sudah meluangkan waktu!
                            </div>
                            <p className={styles.closingText}>
                              Setiap orang memiliki kemampuan dan cara
                              masing-masing untuk berkontribusi. Semoga melalui
                              proses ini, kita dapat menemukan orang-orang yang
                              siap berjalan bersama dan membawa Cavallery menuju
                              perjalanan berikutnya.
                            </p>
                          </div>
                        </div>

                        <div className={styles.stepNavButtons}>
                          <button
                            type="button"
                            className={styles.prevBtn}
                            onClick={() => setAdminStep(2)}
                            disabled={submitting}
                          >
                            <i className="bx bx-left-arrow-alt" /> Kembali
                          </button>
                          <button
                            type="submit"
                            className={styles.nextBtn}
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <i className="bx bx-loader-alt bx-spin" />{" "}
                                Mengirim...
                              </>
                            ) : (
                              <>
                                <i className="bx bx-send" /> Kirim Pendaftaran
                                Admin
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : activeModalRole === "member" ? (
                  /* ══════════════════════════════════════════════════════
                      2. MEMBER REGISTRATION FORM (1-PAGE FORM)
                      ══════════════════════════════════════════════════════ */
                  <>
                    {/* DISCLAIMER IURAN */}
                    <div className={styles.disclaimerBox}>
                      <div className={styles.disclaimerTitle}>
                        <i className="bx bx-info-circle" /> DISCLAIMER IURAN
                        KEANGGOTAAN
                      </div>
                      <div className={styles.disclaimerText}>
                        Sebelum melanjutkan pendaftaran, harap diperhatikan
                        bahwa calon anggota Cavallery yang terpilih memiliki
                        kewajiban untuk membayar iuran sebesar{" "}
                        <strong>Rp75.000</strong>. Iuran tersebut digunakan
                        untuk keperluan operasional fanbase dan pembelian
                        atribut resmi anggota.
                      </div>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={feeAgreed}
                          onChange={(e) => setFeeAgreed(e.target.checked)}
                          required
                        />
                        <span>
                          Saya bersedia dan menyetujui kewajiban membayar iuran
                          sebesar Rp75.000 jika terpilih sebagai anggota resmi.{" "}
                          <span>*</span>
                        </span>
                      </label>
                    </div>

                    <div className={styles.field}>
                      <label>
                        Email Aktif <span>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Contoh: user@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label>
                        Nama Lengkap <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tuliskan nama lengkap kamu"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label>
                        Tahu Cavallery darimana? <span>*</span>
                      </label>
                      <div className={styles.optionsGrid}>
                        {["X", "Instagram", "Tiktok", "Teman", "Yang lain"].map(
                          (src) => (
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
                          ),
                        )}
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

                    <div className={styles.field}>
                      <label>
                        Jenis Kelamin <span>*</span>
                      </label>
                      <div className={styles.optionsGrid}>
                        {["Perempuan", "Laki-laki"].map((g) => (
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

                    <div className={styles.field}>
                      <label>
                        ID Line <span>*</span>
                      </label>
                      <span className={styles.fieldSubtext}>
                        Pastikan ID Line sudah benar dan akun tidak di-private
                        agar bisa diundang ke grup koordinasi.
                      </span>
                      <input
                        type="text"
                        placeholder="Tuliskan ID Line aktif kamu"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label>
                        Display Name Line <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nama tampilan akun Line kamu"
                        value={lineDisplayName}
                        onChange={(e) => setLineDisplayName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label>
                        Domisili <span>*</span>
                      </label>
                      <span className={styles.fieldSubtext}>
                        Tuliskan Kota atau Kabupaten tempat tinggal kamu saat
                        ini.
                      </span>
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
                        Hobby <span>*</span>
                      </label>
                      <span className={styles.fieldSubtext}>
                        Pilih satu atau lebih hobi yang kamu minati.
                      </span>
                      <div className={styles.optionsGrid}>
                        {[
                          "Editing",
                          "Design",
                          "Nonton Show Theater",
                          "Bermain Game",
                          "Bermain Alat Musik",
                          "Menari",
                          "Menulis",
                          "Membaca",
                          "Nonton Film",
                          "Olahraga",
                        ].map((h) => (
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

                    <div className={styles.field}>
                      <span
                        className={styles.fieldSubtext}
                        style={{
                          color: "var(--gold, #b45309)",
                          fontWeight: 600,
                        }}
                      >
                        Silakan isi minimal satu akun media sosial yang aktif.
                        Untuk keperluan pengecekan, mohon agar akun tidak
                        di-private sementara waktu hingga proses pendaftaran
                        selesai.
                      </span>
                    </div>

                    <div className={styles.field}>
                      <label>Username X (Twitter)</label>
                      <input
                        type="text"
                        placeholder="Contoh: @username_x"
                        value={usernameX}
                        onChange={(e) => setUsernameX(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Username Instagram</label>
                      <input
                        type="text"
                        placeholder="Contoh: @username_ig"
                        value={usernameIg}
                        onChange={(e) => setUsernameIg(e.target.value)}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Username TikTok</label>
                      <input
                        type="text"
                        placeholder="Contoh: @username_tiktok"
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
                        Bentuk support apa yang akan kamu berikan kepada
                        Cavallery <span>*</span>
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
                        Punya ide event, project, atau kegiatan seru untuk
                        Cavallery? Tuliskan saranmu di sini!
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
                          Data kalian akan dikumpulkan dan di-screening oleh
                          admin kami untuk proses pemeriksaan sebelum kalian
                          bergabung dengan Cavallery.
                        </div>
                      </div>
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
                          <i className="bx bx-send" /> Kirim Pendaftaran Member
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* ══════════════════════════════════════════════════════
                      3. VOLUNTEER REGISTRATION FORM
                      ══════════════════════════════════════════════════════ */
                  <>
                    <div className={styles.field}>
                      <label>
                        Nama Lengkap <span>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tuliskan nama lengkap kamu"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Nama Panggilan / Nickname</label>
                      <input
                        type="text"
                        placeholder="Tuliskan nama panggilan kamu"
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
                        placeholder="Contoh: @username / discord_tag#0000"
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
                        placeholder="Ceritakan motivasi kamu bergabung sebagai relawan Cavallery..."
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
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
