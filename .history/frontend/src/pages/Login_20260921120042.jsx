import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        // Token ve kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.kullanici));

        // Rol kontrolü ile yönlendirme
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">PathoVision</h1>
          <p className="text-slate-500">Medikal Yapay Zeka Analiz Sistemi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="doktor@klinik.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;