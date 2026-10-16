import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import useToast from "../../hooks/useToast";
import styles from "./Login.module.css";
import useNotifications from "../../hooks/useNotifications";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);

  // GİRİŞ
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginUser(email, sifre);

      if (!data.basarili) {
        toast.error(data.mesaj || "Giriş yapılamadı.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.kullanici));

      const role = data.kullanici?.rol;

      if (role === "doktor" || role === "superadmin") {
        toast.success("Giriş başarılı.");
        navigate("/dashboard");
        return;
      }

      if (role === "hasta") {
        toast.success("Giriş başarılı.");
        navigate("/hasta-panel");
        return;
      }

      toast.warning("Kullanıcı rolü tanımlanamadı.");
    } catch (error) {
      console.error("Giriş hatası:", error);
      toast.error(
        error.response?.data?.mesaj ||
          "Giriş yapılamadı. Sunucu bağlantısını kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* BACKGROUND */}
      <div className={styles.gridBackground}></div>

      <div className={styles.contentWrapper}>
        {/* LOGO */}
        <div className={styles.logoSection}>
          <img
            src="/logo_pathovision.png"
            alt="PathoVision Logo"
            className={styles.logoImage}
          />

          <h1 className={styles.brandTitle}>
            Patho<span className={styles.brandHighlight}>Vision</span>
          </h1>
        </div>

        {/* LOGIN */}
        <div className={styles.loginCard}>
          <h2 className={styles.cardTitle}>Oturum Aç</h2>
          <p className={styles.cardSubtitle}>
            Güvenli sisteme giriş yapmak için bilgilerinizi girin.
          </p>

          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="email">
                E-posta Adresi
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doktor@pathovision.com"
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="password">
                Şifre
              </label>

              <input
                id="password"
                type="password"
                required
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="••••••••"
                className={styles.inputField}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Bağlantı Kuruluyor..." : "GİRİŞ YAP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;