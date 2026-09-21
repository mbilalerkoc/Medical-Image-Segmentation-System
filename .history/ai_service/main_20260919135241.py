# main.py
# FastAPI uygulamasının kalbi
# Tüm parçaları birleştirir, dışarıya API endpoint'leri açar

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from model_manager import modelleri_yukle
from predictor import tahmin_yap

# ── Uygulama Başlarken ────────────────────────────────────
# FastAPI açılınca modelleri yükle, kapanınca temizle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Başlarken:
    modelleri_yukle()   # 4 modeli belleğe al
    yield               # uygulama çalışıyor
    # Kapanırken:
    print("Uygulama kapatılıyor...")


# ── FastAPI Uygulaması ────────────────────────────────────
app = FastAPI(
    lifespan=lifespan,
    title="MediSeg AI Servisi",
    description="Beyin tümörü ve böbrek taşı segmentasyon API'si",
    version="1.0.0"
)

# ── CORS Ayarı ────────────────────────────────────────────
# React (port 3000) ve Node.js (port 5000) buraya istek atacak
# İzin vermezsen tarayıcı isteği engeller
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoint 1: Sağlık Kontrolü ──────────────────────────
# Servisin ayakta olup olmadığını kontrol eder
# Tarayıcıdan: http://localhost:8000/health
@app.get("/health")
def saglik_kontrolu():
    return {
        "durum"  : "çalışıyor",
        "servis" : "MediSeg AI",
        "versiyon": "1.0.0"
    }


# ── Endpoint 2: Mevcut Modeller ───────────────────────────
# Hangi modeller yüklü, listele
# Tarayıcıdan: http://localhost:8000/models
@app.get("/models")
def modelleri_listele():
    from model_manager import yuklenen_modeller
    return {
        "modeller": list(yuklenen_modeller.keys()),
        "toplam"  : len(yuklenen_modeller)
    }


# ── Endpoint 3: Tahmin ────────────────────────────────────
# Ana endpoint — görüntü al, tahmin yap, sonuç döndür
# POST http://localhost:8000/predict/{model_adi}
@app.post("/predict/{model_adi}")
async def tahmin_endpoint(
    model_adi : str,
    dosya     : UploadFile = File(...)
):
    """
    Kullanım:
    POST /predict/beyin_unet    → U-Net ile beyin analizi
    POST /predict/beyin_unet_plus → U-Net++ ile beyin analizi
    POST /predict/bobrek_unet   → U-Net ile böbrek analizi
    POST /predict/bobrek_unet_plus → U-Net++ ile böbrek analizi
    """

    # 1. Dosya formatını kontrol et
    gecerli_formatlar = {"image/jpeg", "image/png", "image/tiff"}
    if dosya.content_type not in gecerli_formatlar:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz format: {dosya.content_type}. "
                   f"PNG, JPG veya TIFF gönderin."
        )

    # 2. Dosyayı byte olarak oku
    dosya_bytes = await dosya.read()

    # 3. Tahmin yap (predictor.py devreye giriyor)
    try:
        sonuc = tahmin_yap(model_adi, dosya_bytes)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tahmin hatası: {str(e)}")

    # 4. Sonucu döndür
    return {
        "basarili"  : True,
        "model_adi" : sonuc["model_adi"],
        "metrikler" : sonuc["metrikler"],
        "maske"     : sonuc["maske"],
    }