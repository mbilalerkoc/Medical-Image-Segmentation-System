import React, { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  updateProfile,
  changePassword,
} from "../../services/settingsService";

import styles from "./Settings.module.css";

const Settings = () => {
  const [user, setUser] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    unvan: "",
    klinik_adi: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    mevcutSifre: "",
    yeniSifre: "",
    yeniSifreTekrar: "",
  });

  // PROFIL
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // SIFRE
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =====================================================
  // KULLANICI BILGILERI
  // =====================================================

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) return;

    try {
      const userObj = JSON.parse(userStr);

      setUser({
        ad: userObj.ad || "",
        soyad: userObj.soyad || "",
        email: userObj.email || "",
        telefon: userObj.telefon || "",
        unvan: userObj.unvan || "",
        klinik_adi:
          userObj.klinik_adi ||
          (userObj.klinik_id
            ? `Klinik ${userObj.klinik_id}`
            : ""),
      });
    } catch (error) {
      console.error(
        "Kullanıcı bilgisi okunamadı:",
        error
      );
    }
  }, []);

  // =====================================================
  // PROFIL INPUT
  // =====================================================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    setProfileSuccess("");
    setProfileError("");
  };

  // =====================================================
  // SIFRE INPUT
  // =====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordSuccess("");
    setPasswordError("");
  };

  // =====================================================
  // PROFILI KAYDET
  // =====================================================

  const handleSaveProfile = async () => {
    try {
      setProfileSuccess("");
      setProfileError("");

      if (
        !user.ad.trim() ||
        !user.soyad.trim() ||
        !user.email.trim()
      ) {
        setProfileError(
          "Ad, soyad ve e-posta alanları zorunludur."
        );

        return;
      }

      setProfileSaving(true);

      const profileData = {
        ad: user.ad.trim(),
        soyad: user.soyad.trim(),
        email: user.email.trim(),
        telefon: user.telefon.trim(),
      };

      const data = await updateProfile(profileData);

      if (!data.basarili) {
        setProfileError(
          data.mesaj ||
            "Profil bilgileri güncellenemedi."
        );

        return;
      }

      // LOCAL STORAGE GUNCELLE
      const oldUserStr =
        localStorage.getItem("user");

      let oldUser = {};

      try {
        oldUser = oldUserStr
          ? JSON.parse(oldUserStr)
          : {};
      } catch {
        oldUser = {};
      }

      const updatedLocalUser = {
        ...oldUser,
        ...data.user,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedLocalUser)
      );

      // STATE GUNCELLE
      setUser((prev) => ({
        ...prev,

        ad:
          data.user?.ad ??
          prev.ad,

        soyad:
          data.user?.soyad ??
          prev.soyad,

        email:
          data.user?.email ??
          prev.email,

        telefon:
          data.user?.telefon ??
          prev.telefon,

        unvan:
          data.user?.unvan ??
          prev.unvan,
      }));

      setProfileSuccess(
        data.mesaj ||
          "Profil bilgileri başarıyla güncellendi."
      );
    } catch (error) {
      console.error(
        "Profil güncelleme hatası:",
        error
      );

      setProfileError(
        error.response?.data?.mesaj ||
          "Profil bilgileri güncellenirken bir hata oluştu."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // =====================================================
  // SIFREYI GUNCELLE
  // =====================================================

  const handleChangePassword = async () => {
    try {
      setPasswordSuccess("");
      setPasswordError("");

      const {
        mevcutSifre,
        yeniSifre,
        yeniSifreTekrar,
      } = passwordForm;

      // BOS ALAN
      if (
        !mevcutSifre ||
        !yeniSifre ||
        !yeniSifreTekrar
      ) {
        setPasswordError(
          "Lütfen tüm şifre alanlarını doldurun."
        );

        return;
      }

      // MINIMUM UZUNLUK
      if (yeniSifre.length < 6) {
        setPasswordError(
          "Yeni şifre en az 6 karakter olmalıdır."
        );

        return;
      }

      // SIFRELER ESLESIYOR MU?
      if (
        yeniSifre !==
        yeniSifreTekrar
      ) {
        setPasswordError(
          "Yeni şifreler birbiriyle eşleşmiyor."
        );

        return;
      }

      // ESKI ILE AYNI MI?
      if (
        mevcutSifre ===
        yeniSifre
      ) {
        setPasswordError(
          "Yeni şifre mevcut şifreden farklı olmalıdır."
        );

        return;
      }

      setPasswordSaving(true);

      const data =
        await changePassword({
          mevcut_sifre:
            mevcutSifre,

          yeni_sifre:
            yeniSifre,

          yeni_sifre_tekrar:
            yeniSifreTekrar,
        });

      if (!data.basarili) {
        setPasswordError(
          data.mesaj ||
            "Şifre güncellenemedi."
        );

        return;
      }

      // BASARILI OLUNCA INPUTLARI TEMIZLE
      setPasswordForm({
        mevcutSifre: "",
        yeniSifre: "",
        yeniSifreTekrar: "",
      });

      setPasswordSuccess(
        data.mesaj ||
          "Şifreniz başarıyla güncellendi."
      );
    } catch (error) {
      console.error(
        "Şifre değiştirme hatası:",
        error
      );

      setPasswordError(
        error.response?.data?.mesaj ||
          "Şifre güncellenirken bir hata oluştu."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // =====================================================
  // AVATAR
  // =====================================================

  const initials =
    `${user.ad?.[0] || ""}${
      user.soyad?.[0] || ""
    }`.toUpperCase();

  return (
    <DashboardLayout title="Ayarlar">
      <div className={styles.container}>

        {/* HEADER */}

        <div className={styles.pageHeader}>
          <span className={styles.pageLabel}>
            Hesap Yönetimi
          </span>

          <h1>Ayarlar</h1>

          <p>
            Profil, klinik ve hesap güvenliği
            bilgilerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        <div className={styles.settingsGrid}>

          {/* SOL PROFIL */}

          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {initials || "DR"}
            </div>

            <h2>
              {user.unvan
                ? `${user.unvan} `
                : ""}

              {user.ad} {user.soyad}
            </h2>

            <p className={styles.profileEmail}>
              {user.email || "-"}
            </p>

            <div
              className={styles.profileDivider}
            ></div>

            <div className={styles.profileInfo}>

              <div>
                <span>Klinik</span>

                <strong>
                  {user.klinik_adi || "-"}
                </strong>
              </div>

              <div>
                <span>Hesap Türü</span>

                <div>
                  <span
                    className={
                      styles.doctorBadge
                    }
                  >
                    Doktor
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* SAG */}

          <div className={styles.contentColumn}>

            {/* PROFIL */}

            <div className={styles.settingsCard}>

              <div className={styles.cardHeader}>
                <h2>Profil Bilgileri</h2>

                <p>
                  Doktor hesabınıza ait temel bilgiler.
                </p>
              </div>

              <div className={styles.cardBody}>

                <div className={styles.formGrid}>

                  <div className={styles.formGroup}>
                    <label>Ad</label>

                    <input
                      type="text"
                      name="ad"
                      value={user.ad}
                      onChange={
                        handleProfileChange
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Soyad</label>

                    <input
                      type="text"
                      name="soyad"
                      value={user.soyad}
                      onChange={
                        handleProfileChange
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>E-posta</label>

                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={
                        handleProfileChange
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Telefon</label>

                    <input
                      type="text"
                      name="telefon"
                      value={user.telefon}
                      onChange={
                        handleProfileChange
                      }
                      placeholder="Telefon numarası"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ünvan</label>

                    <input
                      type="text"
                      value={user.unvan}
                      disabled
                      className={
                        styles.disabledInput
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Klinik</label>

                    <input
                      type="text"
                      value={user.klinik_adi}
                      disabled
                      className={
                        styles.disabledInput
                      }
                    />
                  </div>

                </div>

                {profileSuccess && (
                  <div
                    className={
                      styles.successMessage
                    }
                  >
                    ✓ {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div
                    className={
                      styles.errorMessage
                    }
                  >
                    {profileError}
                  </div>
                )}

                <div className={styles.buttonArea}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaving
                      ? "Kaydediliyor..."
                      : "Değişiklikleri Kaydet"}
                  </button>
                </div>

              </div>
            </div>

            {/* SIFRE */}

            <div className={styles.settingsCard}>

              <div className={styles.cardHeader}>
                <h2>Şifre Değiştir</h2>

                <p>
                  Hesabınızın güvenliği için güçlü
                  bir şifre kullanın.
                </p>
              </div>

              <div className={styles.cardBody}>

                <div className={styles.formGroup}>
                  <label>Mevcut Şifre</label>

                  <input
                    type="password"
                    name="mevcutSifre"
                    value={
                      passwordForm.mevcutSifre
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>

                <div className={styles.formGrid}>

                  <div className={styles.formGroup}>
                    <label>Yeni Şifre</label>

                    <input
                      type="password"
                      name="yeniSifre"
                      value={
                        passwordForm.yeniSifre
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="En az 6 karakter"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Yeni Şifre Tekrar
                    </label>

                    <input
                      type="password"
                      name="yeniSifreTekrar"
                      value={
                        passwordForm.yeniSifreTekrar
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Yeni şifreyi tekrar girin"
                    />
                  </div>

                </div>

                {/* SIFRE MESAJLARI */}

                {passwordSuccess && (
                  <div
                    className={
                      styles.successMessage
                    }
                  >
                    ✓ {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div
                    className={
                      styles.errorMessage
                    }
                  >
                    {passwordError}
                  </div>
                )}

                <div className={styles.buttonArea}>
                  <button
                    type="button"
                    className={
                      styles.passwordButton
                    }
                    onClick={
                      handleChangePassword
                    }
                    disabled={
                      passwordSaving
                    }
                  >
                    {passwordSaving
                      ? "Güncelleniyor..."
                      : "Şifreyi Güncelle"}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;