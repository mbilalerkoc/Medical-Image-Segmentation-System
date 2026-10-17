Seçilen model yapay zeka servisine gönderilir ve ilgili model görüntü üzerinde segmentasyon işlemini gerçekleştirir.

Bu yapı sayesinde modeller aynı sistem içerisinde bağımsız olarak kullanılabilir ve sonuçları karşılaştırılabilir.

---

## 🔬 Yapay Zeka Analiz Sonuçları

Bir medikal görüntü analiz edildiğinde sistem yalnızca segmentasyon maskesi üretmez.

Analiz sonucunda aşağıdaki bilgiler kullanıcıya sunulur:

- Orijinal medikal görüntü
- Yapay zeka segmentasyon maskesi
- Patoloji yüzdesi
- Güven skoru
- Patolojik alanın büyüklüğü
- Çevre ölçümü
- Kullanılan yapay zeka modeli
- Analiz tarihi
- Doktor değerlendirmesi

Orijinal görüntü ile yapay zeka tarafından oluşturulan segmentasyon maskesi üst üste bindirilerek de incelenebilir.

Doktor, görüntü karşılaştırma ekranındaki slider yardımıyla orijinal görüntü ile AI segmentasyonu arasında geçiş yapabilir.

---

## 👥 Rol Bazlı Panel Yapısı

PathoVision, kullanıcıların sistem içerisindeki yetkilerine göre üç temel kullanıcı rolü üzerine tasarlanmıştır:

- Super Admin
- Doktor
- Hasta

Her kullanıcı yalnızca kendi rolüne ait işlemlere ve verilere erişebilir.

---

## 🛡️ Super Admin Paneli

Super Admin, sistemin genel yönetiminden sorumludur.

Super Admin paneli üzerinden sistem içerisindeki kullanıcılar, doktorlar, hastalar ve klinik yapıları yönetilebilir.

Başlıca özellikler:

- Sistem kullanıcılarını yönetme
- Doktor hesaplarını yönetme
- Hasta hesaplarını yönetme
- Klinik bilgilerini yönetme
- Kullanıcı rollerini kontrol etme
- Sistem genelindeki kayıtları takip etme
- Yetkilendirme işlemlerini yönetme

Rol bazlı erişim kontrolü sayesinde normal kullanıcıların Super Admin işlemlerine erişmesi engellenir.

---

## 👨‍⚕️ Doktor Paneli

Doktor paneli, PathoVision sisteminin temel çalışma alanlarından biridir.

Doktorlar sisteme giriş yaptıktan sonra hastalarını, analizleri, randevuları ve hesap bilgilerini tek panel üzerinden yönetebilir.

### 📊 Dashboard

Dashboard ekranında doktora ait önemli bilgiler özet olarak gösterilir.

Gösterilen bilgiler arasında:

- Toplam hasta sayısı
- Toplam analiz sayısı
- Tamamlanan analizler
- Bekleyen analizler
- Bugünkü randevular
- Yaklaşan randevular

bulunur.

---

### 🧠 Yeni Analiz

Doktor, hastaya ait medikal görüntüyü sisteme yükleyerek yeni bir yapay zeka analizi başlatabilir.

Analiz süreci genel olarak şu şekilde ilerler:

1. Hastanın TC Kimlik Numarası girilir.
2. İncelenecek organ seçilir.
3. Kullanılacak yapay zeka modeli belirlenir.
4. Medikal görüntü sisteme yüklenir.
5. Görüntü yapay zeka servisine gönderilir.
6. U-Net veya U-Net++ modeli görüntüyü analiz eder.
7. Segmentasyon maskesi oluşturulur.
8. Klinik metrikler hesaplanır.
9. Analiz sonucu doktor panelinde görüntülenir.
10. Analiz kaydı sistemde saklanır.

---

### 👥 Hasta Yönetimi

Doktor kendi hastalarını sistem üzerinden görüntüleyebilir.

Hasta detay ekranı üzerinden hastaya ait geçmiş bilgiler ve analiz kayıtları incelenebilir.

Başlıca bilgiler:

- Hasta bilgileri
- Geçmiş analizler
- Analiz tarihleri
- Kullanılan yapay zeka modelleri
- Analiz sonuçları
- Klinik raporlar

---

### 📅 Randevu Yönetimi

Doktorlar hastalarına ait randevuları sistem üzerinden yönetebilir.

Randevularda aşağıdaki bilgiler tutulur:

- Hasta
- Tarih
- Saat
- Süre
- Randevu nedeni
- Doktor notu
- Randevu durumu

Randevular oluşturulabilir ve mevcut randevuların durumları güncellenebilir.

---

### 📄 Analiz Detayı ve Raporlama

Gerçekleştirilen her analiz ayrı bir detay ekranından görüntülenebilir.

Doktor analiz detayında:

- Orijinal medikal görüntüyü
- AI segmentasyon maskesini
- Patoloji yüzdesini
- Güven skorunu
- Alan ölçümünü
- Çevre ölçümünü
- Kullanılan modeli
- Hasta bilgilerini

inceleyebilir.

Analiz sonuçları üzerinden doktor değerlendirmesi oluşturulabilir ve raporlama işlemleri gerçekleştirilebilir.

---

### 🔔 Bildirim Sistemi

PathoVision içerisinde merkezi bir bildirim sistemi bulunmaktadır.

Sistem içerisinde gerçekleşen önemli olaylar sonucunda kullanıcıya otomatik bildirim oluşturulur.

Bildirimler aşağıdaki seviyelere ayrılır:

- `info`
- `success`
- `warning`
- `danger`

Bildirim sistemi;

- Randevu işlemleri
- Hesap güvenliği
- Şifre değişikliği
- Sistem olayları
- Önemli kullanıcı işlemleri

gibi durumlarda kullanıcıyı bilgilendirmek için kullanılır.

Kullanıcılar bildirimleri tek tek okuyabilir veya tüm bildirimleri toplu olarak okundu şeklinde işaretleyebilir.

---

### ⚙️ Profil ve Hesap Ayarları

Doktor kendi hesap bilgilerini Ayarlar ekranı üzerinden yönetebilir.

Desteklenen işlemler:

- Ad güncelleme
- Soyad güncelleme
- E-posta güncelleme
- Telefon güncelleme
- Profil fotoğrafı yükleme
- Profil fotoğrafını değiştirme
- Profil fotoğrafını kaldırma
- Şifre değiştirme
- Çalışma saatlerini düzenleme

Profil fotoğrafları sunucudaki `uploads/profile` klasöründe saklanır.

Veritabanında ise kullanıcının profil fotoğrafına ait dosya yolu tutulur.

---

## 🧑 Hasta Paneli

Hasta rolü, hastaların kendi hesaplarına ve kendilerine ait sağlık kayıtlarına kontrollü şekilde erişebilmesi amacıyla sistem mimarisinde bulunmaktadır.

Hasta paneli için sistem içerisinde aşağıdaki yapıların kullanılması hedeflenmektedir:

- Kişisel bilgiler
- Randevular
- Analiz geçmişi
- Klinik raporlar
- Bildirimler

Rol bazlı yetkilendirme sayesinde hasta yalnızca kendisine ait verilere erişebilir.

---

## 🏗️ Sistem Mimarisi

PathoVision, farklı servislerin birlikte çalıştığı modüler bir mimariye sahiptir.

```text
┌───────────────────────────┐
│          React            │
│         Frontend          │
└─────────────┬─────────────┘
              │
              │ REST API
              ▼
┌───────────────────────────┐
│      Node.js / Express    │
│          Backend          │
└─────────────┬─────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌────────────────┐
│ PostgreSQL  │  │ Python AI API  │
│  Database   │  │    FastAPI     │
└─────────────┘  └───────┬────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │ U-Net / U-Net++│
                 │ TensorFlow     │
                 └────────────────┘
```

Frontend tarafında React kullanılırken, ana backend işlemleri Node.js ve Express üzerinden gerçekleştirilmektedir.

Yapay zeka işlemleri ise Python ve FastAPI kullanılarak ayrı bir servis olarak çalışmaktadır.

Bu yapı sayesinde web uygulaması ile yapay zeka modeli birbirinden bağımsız olarak geliştirilebilir.

---

## 🛠️ Kullanılan Teknolojiler

### Frontend

- React
- React Router
- Axios
- CSS Modules
- JavaScript
- Vite

### Backend

- Node.js
- Express.js
- Sequelize ORM
- REST API
- JWT Authentication
- Multer

### Veritabanı

- PostgreSQL

### Yapay Zeka

- Python
- FastAPI
- TensorFlow
- Keras
- U-Net
- U-Net++
- NumPy
- OpenCV
- Scikit-Image
- Matplotlib

---

## 🔐 Güvenlik

PathoVision içerisinde kullanıcı ve sağlık verilerinin korunması amacıyla çeşitli güvenlik mekanizmaları kullanılmaktadır.

Başlıca güvenlik önlemleri:

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme
- Şifrelerin bcrypt ile hashlenmesi
- Yetkisiz API erişimlerinin engellenmesi
- Dosya formatı kontrolü
- Dosya boyutu kontrolü
- Kullanıcı bazlı veri erişimi
- Middleware tabanlı endpoint koruması

---

## 📂 Proje Yapısı

Projenin genel yapısı aşağıdaki gibidir:

```text
📦 PathoVision
│
├── 📂 frontend
│   └── React tabanlı web arayüzü
│
├── 📂 backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── services
│   ├── middlewares
│   ├── config
│   └── uploads
│
├── 📂 ai_engine
│   ├── model yükleme
│   ├── görüntü işleme
│   ├── segmentasyon
│   ├── metrik hesaplama
│   └── saved_models
│
├── 📂 dataset
│   └── Eğitim ve test görüntüleri
│
├── 📂 docs
│   └── Proje sonuçları ve dokümantasyon
│
└── 📄 README.md
```

---

## 🔄 Analiz Akışı

PathoVision içerisinde medikal görüntünün analiz süreci aşağıdaki mimari üzerinden gerçekleşir:

```text
Medikal Görüntü
       │
       ▼
React Frontend
       │
       ▼
Node.js / Express Backend
       │
       ▼
FastAPI AI Servisi
       │
       ▼
U-Net / U-Net++
       │
       ▼
Segmentasyon Maskesi
       │
       ▼
Klinik Metrikler
       │
       ▼
PostgreSQL
       │
       ▼
Doktor Paneli
```

---

## 📊 Segmentasyon Süreci

Yapay zeka analiz süreci genel olarak aşağıdaki adımlardan oluşmaktadır:

1. Medikal görüntü sisteme yüklenir.
2. Görüntü backend üzerinden AI servisine gönderilir.
3. Görüntü modele uygun şekilde ön işleme tabi tutulur.
4. Seçilen U-Net veya U-Net++ modeli tahmin gerçekleştirir.
5. Segmentasyon maskesi oluşturulur.
6. Maske üzerinden gerekli ölçümler hesaplanır.
7. Analiz sonuçları backend'e gönderilir.
8. Sonuçlar veritabanına kaydedilir.
9. Doktor panelinde görselleştirilir.

---

## 🚀 Projenin Geliştirilme Amacı

PathoVision;

**Yapay Zeka + Web Teknolojileri + Sağlık Bilişimi**

alanlarının bir araya getirildiği kapsamlı bir yazılım projesidir.

Projede yalnızca bir yapay zeka modeli geliştirmek yerine, geliştirilen modelin gerçek bir web uygulaması içerisinde kullanılabileceği uçtan uca bir sistem oluşturulması amaçlanmıştır.

Proje kapsamında:

- Yapay zeka modeli geliştirme
- Medikal görüntü segmentasyonu
- Model servisleştirme
- REST API geliştirme
- Veritabanı tasarımı
- Frontend geliştirme
- Kullanıcı kimlik doğrulama
- Rol bazlı yetkilendirme
- Hasta yönetimi
- Randevu yönetimi
- Bildirim sistemi
- Profil yönetimi
- Raporlama

gibi farklı yazılım geliştirme süreçleri tek bir sistem içerisinde bir araya getirilmiştir.

---

## ⚠️ Uyarı

Bu proje eğitim ve araştırma amacıyla geliştirilmiştir.

PathoVision tarafından oluşturulan yapay zeka sonuçları profesyonel tıbbi değerlendirme veya kesin tanı yerine kullanılmamalıdır.