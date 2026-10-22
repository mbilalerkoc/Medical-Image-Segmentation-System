import React, { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { setPassword } from "../../../services/authService";
import useToast from "../../../hooks/useToast";

import styles from "./SetPassword.module.css";

const SetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchParams] = useSearchParams();

  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Geçersiz davet bağlantısı.");
      return;
    }

    if (sifre.length < 6) {
      toast.warning("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (sifre !== sifreTekrar) {
      toast.warning("Girdiğiniz şifreler eşleşmiyor.");
      return;
    }

    try {
      setLoading(true);

      const data = await setPassword(token, sifre);

      if (!data.basarili) {
        toast.error(
          data.mesaj || "Şifre oluşturulamadı.",
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.kullanici),
      );

      toast.success(
        "Şifreniz başarıyla oluşturuldu.",
      );

      if (data.kullanici?.rol === "hasta") {
        navigate("/patient/dashboard", {
          replace: true,
        });
        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Şifre oluşturma hatası:",
        error,
      );

      toast.error(
        error.response?.data?.mesaj ||
          "Şifre oluşturulurken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <img
            src="/logo_pathovision.png"
            alt="PathoVision Logo"
            className={styles.logo}
          />

          <h1 className={styles.brand}>
            Patho
            <span className={styles.brandHighlight}>
              Vision
            </span>
          </h1>
        </div>

        <div className={styles.header}>
          <h2>Şifrenizi Oluşturun</h2>

          <p>
            PathoVision hesabınızı aktifleştirmek için
            kullanacağınız şifreyi belirleyin.
          </p>
        </div>

        {!token ? (
          <div className={styles.invalidLink}>
            Bu davet bağlantısı geçersiz.
          </div>
        ) : (
          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.inputGroup}>
              <label htmlFor="password">
                Yeni Şifre
              </label>

              <input
                id="password"
                type="password"
                value={sifre}
                onChange={(e) =>
                  setSifre(e.target.value)
                }
                placeholder="En az 6 karakter"
                autoComplete="new-password"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="passwordConfirm">
                Yeni Şifre Tekrar
              </label>

              <input
                id="passwordConfirm"
                type="password"
                value={sifreTekrar}
                onChange={(e) =>
                  setSifreTekrar(e.target.value)
                }
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Şifre Oluşturuluyor..."
                : "ŞİFREMİ OLUŞTUR"}
            </button>
          </form>
        )}

        <div className={styles.loginLink}>
          <span>Zaten şifreniz var mı?</span>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;