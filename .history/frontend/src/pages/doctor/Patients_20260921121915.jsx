import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Yeni Hasta Form State
  const [formData, setFormData] = useState({
    ad: '', soyad: '', tc_kimlik: '', email: '', 
    telefon: '', dogum_tarihi: '', kan_grubu: 'Belirtilmedi', adres: ''
  });

  // Bileşen yüklendiğinde hastaları getir
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      // Backend rotasını birazdan yazacağız
      const response = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.basarili) {
        setPatients(response.data.hastalar);
      }
    } catch (error) {
      console.error("Hastalar yüklenirken hata:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/patients/add', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.basarili) {
        alert("Hasta başarıyla eklendi ve davet maili (şifre belirleme linki) gönderildi!");
        setShowModal(false);
        setFormData({ ad: '', soyad: '', tc_kimlik: '', email: '', telefon: '', dogum_tarihi: '', kan_grubu: 'Belirtilmedi', adres: '' });
        fetchPatients(); // Listeyi yenile
      }
    } catch (error) {
      alert(error.response?.data?.mesaj || "Hasta eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Hastalarım">
      <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Kayıtlı Hastalar</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            + Yeni Hasta Ekle
          </button>
        </div>

        {/* HASTA LİSTESİ TABLOSU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-3 font-semibold">TC Kimlik</th>
                <th className="p-3 font-semibold">Ad Soyad</th>
                <th className="p-3 font-semibold">E-posta</th>
                <th className="p-3 font-semibold">Telefon</th>
                <th className="p-3 font-semibold text-center">Durum</th>
                <th className="p-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">Henüz kayıtlı hasta bulunmuyor.</td>
                </tr>
              ) : (
                patients.map((hasta) => (
                  <tr key={hasta.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-700">{hasta.tc_kimlik}</td>
                    <td className="p-3 font-medium text-slate-800">{hasta.ad} {hasta.soyad}</td>
                    <td className="p-3 text-slate-600">{hasta.email}</td>
                    <td className="p-3 text-slate-600">{hasta.telefon}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${hasta.User?.aktif ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {hasta.User?.aktif ? 'Aktif' : 'Şifre Bekliyor'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Detay</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* YENİ HASTA EKLEME MODALI */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Yeni Hasta Kaydı Oluştur</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
                  <input type="text" name="ad" required value={formData.ad} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
                  <input type="text" name="soyad" required value={formData.soyad} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TC Kimlik No</label>
                  <input type="text" name="tc_kimlik" required maxLength="11" value={formData.tc_kimlik} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <input type="text" name="telefon" value={formData.telefon} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Doğum Tarihi</label>
                  <input type="date" name="dogum_tarihi" value={formData.dogum_tarihi} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">İptal</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-lg font-medium shadow-md transition ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet ve Davet Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Patients;