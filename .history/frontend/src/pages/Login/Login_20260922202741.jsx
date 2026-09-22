import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Oluşturduğumuz CSS modülünü import ediyoruz
import styles from '.Login/Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        sifre
      });

      if (response.data.basarili) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.kullanici));

        const role = response.data.kullanici.rol;
        if (role === 'doktor' || role === 'superadmin') {
          navigate('/dashboard');
        } else if (role === 'hasta') {
          navigate('/hasta-panel');
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.mesaj || 'Giriş yapılamadı. Sunucu bağlantısını kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Dekoratif Arka Plan */}
      <div className={styles.gridBackground}></div>

      <div className={styles.contentWrapper}>
        
        {/* Logo ve Marka */}
        <div className={styles.logoSection}>
          <img src="/logo_pathovision.png" alt="PathoVision Logo" className={styles.logoImage} />
          <h1 className={styles.brandTitle}>
            Patho<span className={styles.brandHighlight}>Vision</span>
          </h1>
        </div>

        {/* Login Form Kartı */}
        <div className={styles.loginCard}>
          <h2 className={styles.cardTitle}>Oturum Aç</h2>
          <p className={styles.cardSubtitle}>Güvenli sisteme giriş yapmak için bilgilerinizi girin.</p>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>E-posta Adresi</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doktor@pathovision.com"
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Şifre</label>
              <input
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
              {loading ? 'Bağlantı Kuruluyor...' : 'GİRİŞ YAP'}
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;