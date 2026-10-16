import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import AvailabilitySettings from "./components/AvailabilitySettings";
import { updateProfile, changePassword } from "../../services/settingsService";
import useToast from "../../hooks/useToast";
import styles from "./Settings.module.css";

const Settings = () => {
  const toast = useToast();

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

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // KULLANICI BİLGİLERİ
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
          (userObj.klinik_id ? `Klinik ${userObj.klinik_id}` : ""),
      });
    } catch (error) {
      console.error("Kullanıcı bilgisi okunamadı:", error);
      toast.error("Kullanıcı bilgileri okunamadı.");
    }
  }, [toast]);

  // PROFİL INPUT
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ŞİFRE INPUT
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PROFİLİ KAYDET
  const handleSaveProfile = async () => {
    if (!user.ad.trim() || !user.soyad.trim() || !user.email.trim()) {
      toast.warning("Ad, soyad ve e-posta alanları zorunludur.");
      return;
    }

    try {
      setProfileSaving(true);

      const profileData = {
        ad: user.ad.trim(),
        soyad: user.soyad.trim(),
        email: user.email.trim(),
        telefon: user.telefon.trim(),
      };

      const data = await updateProfile(profileData);

      if (!data.basarili) {
        toast.error(data.mesaj || "Profil bilgileri güncellenemedi.");
        return;
      }

      const oldUserStr = localStorage.getItem("user");
      let oldUser = {};

      try {
        oldUser = oldUserStr ? JSON.parse(oldUserStr) : {};
      } catch {
        oldUser = {};
      }

      const updatedLocalUser = {
        ...oldUser,
        ...data.user,
      };

      localStorage.setItem("user", JSON.stringify(updatedLocalUser));

      setUser((prev) => ({
        ...prev,
        ad: data.user?.ad ?? prev.ad,
        soyad: data.user?.soyad ?? prev.soyad,
        email: data.user?.email ?? prev.email,
        telefon: data.user?.telefon ?? prev.telefon,
        unvan: data.user?.unvan ?? prev.unvan,
      }));

      toast.success(
        data.mesaj || "Profil bilgileri başarıyla güncellendi.",
      );
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          "Profil bilgileri güncellenirken bir hata oluştu.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // ŞİFREYİ GÜNCELLE
  const handleChangePassword = async () => {
    const { mevcutSifre, yeniSifre, yeniSifreTekrar } = passwordForm;

    if (!mevcutSifre || !yeniSifre || !yeniSifreTekrar) {
      toast.warning("Lütfen tüm şifre alanlarını doldurun.");
      return;
    }

    if (yeniSifre.length < 6) {
      toast.warning("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (yeniSifre !== yeniSifreTekrar) {
      toast.warning("Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (mevcutSifre === yeniSifre) {
      toast.warning("Yeni şifre mevcut şifreden farklı olmalıdır.");
      return;
    }

    try {
      setPasswordSaving(true);

      const data = await changePassword({
        mevcut_sifre: mevcutSifre,
        yeni_sifre: yeniSifre,
        yeni_sifre_tekrar: yeniSifreTekrar,
      });

      if (!data.basarili) {
        toast.error(data.mesaj || "Şifre güncellenemedi.");
        return;
      }

      setPasswordForm({
        mevcutSifre: "",
        yeniSifre: "",
        yeniSifreTekrar: "",
      });

      toast.success(data.mesaj || "Şifreniz başarıyla güncellendi.");
    } catch (error) {
      console.error("Şifre değiştirme hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          "Şifre güncellenirken bir hata oluştu.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = `${user.ad?.[0] || ""}${user.soyad?.[0] || ""}`.toUpperCase();

  return (
    <DashboardLayout title="Ayarlar">
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.pageHeader}>
          <span className={styles.pageLabel}>Hesap Yönetimi</span>
          <h1>Ayarlar</h1>
          <p>
            Profil, klinik ve hesap güvenliği bilgilerinizi buradan
            yönetebilirsiniz.
          </p>
        </div>

        <div className={styles.settingsGrid}>
          {/* PROFİL */}
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initials || "DR"}</div>

            <h2>
              {user.unvan ? `${user.unvan} ` : ""}
              {user.ad} {user.soyad}
            </h2>

            <p className={styles.profileEmail}>{user.email || "-"}</p>

            <div className={styles.profileDivider}></div>

            <div className={styles.profileInfo}>
              <div>
                <span>Klinik</span>
                <strong>{user.klinik_adi || "-"}</strong>
              </div>

              <div>
                <span>Hesap Türü</span>
                <div>
                  <span className={styles.doctorBadge}>Doktor</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contentColumn}>
            {/* PROFİL BİLGİLERİ */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <h2>Profil Bilgileri</h2>
                <p>Doktor hesabınıza ait temel bilgiler.</p>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Ad</label>
                    <input
                      type="text"
                      name="ad"
                      value={user.ad}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Soyad</label>
                    <input
                      type="text"
                      name="soyad"
                      value={user.soyad}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>E-posta</label>
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Telefon</label>
                    <input
                      type="text"
                      name="telefon"
                      value={user.telefon}
                      onChange={handleProfileChange}
                      placeholder="Telefon numarası"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ünvan</label>
                    <input
                      type="text"
                      value={user.unvan}
                      disabled
                      className={styles.disabledInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Klinik</label>
                    <input
                      type="text"
                      value={user.klinik_adi}
                      disabled
                      className={styles.disabledInput}
                    />
                  </div>
                </div>

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

            {/* ŞİFRE */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <h2>Şifre Değiştir</h2>
                <p>Hesabınızın güvenliği için güçlü bir şifre kullanın.</p>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Mevcut Şifre</label>
                  <input
                    type="password"
                    name="mevcutSifre"
                    value={passwordForm.mevcutSifre}
                    onChange={handlePasswordChange}
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Yeni Şifre</label>
                    <input
                      type="password"
                      name="yeniSifre"
                      value={passwordForm.yeniSifre}
                      onChange={handlePasswordChange}
                      placeholder="En az 6 karakter"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Yeni Şifre Tekrar</label>
                    <input
                      type="password"
                      name="yeniSifreTekrar"
                      value={passwordForm.yeniSifreTekrar}
                      onChange={handlePasswordChange}
                      placeholder="Yeni şifreyi tekrar girin"
                    />
                  </div>
                </div>

                <div className={styles.buttonArea}>
                  <button
                    type="button"
                    className={styles.passwordButton}
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </button>
                </div>
              </div>
            </div>

            <AvailabilitySettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;