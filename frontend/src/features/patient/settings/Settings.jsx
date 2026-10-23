import React, { useEffect, useRef, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";

import {
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  changePassword,
  getProfilePhotoUrl,
} from "../../../services/settingsService";

import useToast from "../../../hooks/useToast";

import styles from "./Settings.module.css";

const Settings = () => {
  const toast = useToast();
  const photoInputRef = useRef(null);

  const [user, setUser] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    profil_resmi: "",
  });

  const [editForm, setEditForm] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    mevcutSifre: "",
    yeniSifre: "",
    yeniSifreTekrar: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      return;
    }

    try {
      const userObj = JSON.parse(userStr);

      const currentUser = {
        ad: userObj.ad || "",
        soyad: userObj.soyad || "",
        email: userObj.email || "",
        telefon: userObj.telefon || "",
        profil_resmi: userObj.profil_resmi || "",
      };

      setUser(currentUser);

      setEditForm({
        ad: currentUser.ad,
        soyad: currentUser.soyad,
        email: currentUser.email,
        telefon: currentUser.telefon,
      });
    } catch (error) {
      console.error("Kullanıcı bilgisi okunamadı:", error);

      toast.error("Kullanıcı bilgileri okunamadı.");
    }
  }, [toast]);

  const updateLocalUser = (data) => {
    let oldUser = {};

    try {
      const userStr = localStorage.getItem("user");

      oldUser = userStr ? JSON.parse(userStr) : {};
    } catch {
      oldUser = {};
    }

    const updatedUser = {
      ...oldUser,
      ...data,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    window.dispatchEvent(new Event("userUpdated"));

    return updatedUser;
  };

  const handleEdit = () => {
    setEditForm({
      ad: user.ad,
      soyad: user.soyad,
      email: user.email,
      telefon: user.telefon,
    });

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({
      ad: user.ad,
      soyad: user.soyad,
      email: user.email,
      telefon: user.telefon,
    });

    setIsEditing(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoSelect = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.warning(
        "Profil fotoğrafı JPG, PNG veya WEBP formatında olmalıdır.",
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Profil fotoğrafı en fazla 5 MB olabilir.");

      e.target.value = "";
      return;
    }

    try {
      setPhotoSaving(true);

      const data = await uploadProfilePhoto(file);

      if (!data.basarili) {
        toast.error(data.mesaj || "Profil fotoğrafı güncellenemedi.");

        return;
      }

      const photoPath = data.profil_resmi || data.user?.profil_resmi || "";

      setUser((prev) => ({
        ...prev,
        profil_resmi: photoPath,
      }));

      updateLocalUser({
        ...(data.user || {}),
        profil_resmi: photoPath,
      });

      toast.success(data.mesaj || "Profil fotoğrafı güncellendi.");
    } catch (error) {
      console.error("Profil fotoğrafı yükleme hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          "Profil fotoğrafı yüklenirken bir hata oluştu.",
      );
    } finally {
      setPhotoSaving(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setPhotoSaving(true);

      const data = await deleteProfilePhoto();

      if (!data.basarili) {
        toast.error(data.mesaj || "Profil fotoğrafı kaldırılamadı.");

        return;
      }

      setUser((prev) => ({
        ...prev,
        profil_resmi: "",
      }));

      updateLocalUser({
        profil_resmi: "",
      });

      toast.success(data.mesaj || "Profil fotoğrafı kaldırıldı.");
    } catch (error) {
      console.error("Profil fotoğrafı silme hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          "Profil fotoğrafı kaldırılırken bir hata oluştu.",
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (
      !editForm.ad.trim() ||
      !editForm.soyad.trim() ||
      !editForm.email.trim()
    ) {
      toast.warning("Ad, soyad ve e-posta alanları zorunludur.");

      return;
    }

    try {
      setProfileSaving(true);

      const profileData = {
        ad: editForm.ad.trim(),
        soyad: editForm.soyad.trim(),
        email: editForm.email.trim(),
        telefon: editForm.telefon.trim(),
      };

      const data = await updateProfile(profileData);

      if (!data.basarili) {
        toast.error(data.mesaj || "Profil bilgileri güncellenemedi.");

        return;
      }

      const updatedUser = {
        ...user,
        ad: data.user?.ad ?? editForm.ad,
        soyad: data.user?.soyad ?? editForm.soyad,
        email: data.user?.email ?? editForm.email,
        telefon: data.user?.telefon ?? editForm.telefon,
        profil_resmi: data.user?.profil_resmi ?? user.profil_resmi,
      };

      setUser(updatedUser);

      setEditForm({
        ad: updatedUser.ad,
        soyad: updatedUser.soyad,
        email: updatedUser.email,
        telefon: updatedUser.telefon,
      });

      updateLocalUser(data.user || updatedUser);

      setIsEditing(false);

      toast.success(data.mesaj || "Profil bilgileri başarıyla güncellendi.");
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        error.response?.data?.mesaj || "Şifre güncellenirken bir hata oluştu.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials =
    `${user.ad?.[0] || ""}${user.soyad?.[0] || ""}`.toUpperCase() || "H";

  const profilePhoto = getProfilePhotoUrl(user.profil_resmi);

  return (
    <DashboardLayout title="Ayarlar">
      <div className={styles.container}>
        <div className={styles.settingsGrid}>
          <section className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2>Profil Bilgileri</h2>

              {!isEditing && (
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={handleEdit}
                >
                  Düzenle
                </button>
              )}
            </div>

            <div className={styles.cardBody}>
              <div className={styles.profileTop}>
                <div className={styles.avatar}>
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profil" />
                  ) : (
                    initials
                  )}
                </div>

                <div className={styles.profileIdentity}>
                  <strong>
                    {user.ad} {user.soyad}
                  </strong>

                  <span>{user.email || "-"}</span>

                  {isEditing && (
                    <div className={styles.photoActions}>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className={styles.photoInput}
                        onChange={handlePhotoChange}
                      />

                      <button
                        type="button"
                        className={styles.photoButton}
                        onClick={handlePhotoSelect}
                        disabled={photoSaving}
                      >
                        {photoSaving
                          ? "Yükleniyor..."
                          : profilePhoto
                            ? "Fotoğrafı Değiştir"
                            : "Fotoğraf Ekle"}
                      </button>

                      {profilePhoto && (
                        <button
                          type="button"
                          className={styles.removePhotoButton}
                          onClick={handleDeletePhoto}
                          disabled={photoSaving}
                        >
                          Kaldır
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Ad</label>

                      <input
                        type="text"
                        name="ad"
                        value={editForm.ad}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Soyad</label>

                      <input
                        type="text"
                        name="soyad"
                        value={editForm.soyad}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>E-posta</label>

                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Telefon</label>

                      <input
                        type="text"
                        name="telefon"
                        value={editForm.telefon}
                        onChange={handleProfileChange}
                        placeholder="Telefon numarası"
                      />
                    </div>
                  </div>

                  <div className={styles.buttonArea}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancelEdit}
                      disabled={profileSaving || photoSaving}
                    >
                      Vazgeç
                    </button>

                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleSaveProfile}
                      disabled={profileSaving || photoSaving}
                    >
                      {profileSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <span>Ad</span>
                    <strong>{user.ad || "-"}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Soyad</span>
                    <strong>{user.soyad || "-"}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>E-posta</span>
                    <strong>{user.email || "-"}</strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span>Telefon</span>
                    <strong>{user.telefon || "-"}</strong>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2>Şifre Değiştir</h2>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Mevcut Şifre</label>

                <input
                  type="password"
                  name="mevcutSifre"
                  value={passwordForm.mevcutSifre}
                  onChange={handlePasswordChange}
                  placeholder="Mevcut şifreniz"
                />
              </div>

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
                  placeholder="Yeni şifrenizi tekrar girin"
                />
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
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
