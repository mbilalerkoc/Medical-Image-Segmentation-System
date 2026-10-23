const authService = require("../services/authService");

const handleError = (res, error, defaultMessage, logLabel) => {
  console.error(`${logLabel}:`, error.message);

  return res.status(error.status || 500).json({
    basarili: false,
    mesaj: error.status ? error.message : defaultMessage,
    ...(error.status
      ? {}
      : {
          hata: error.message,
        }),
  });
};

exports.login = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    const result = await authService.login(email, sifre);

    return res.status(200).json({
      basarili: true,
      token: result.token,
      kullanici: result.kullanici,
    });
  } catch (error) {
    return handleError(res, error, "Giriş işlemi başarısız.", "LOGIN HATASI");
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { token, sifre } = req.body;

    const result = await authService.setPassword(token, sifre);

    return res.status(200).json({
      basarili: true,
      token: result.token,
      kullanici: result.kullanici,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Şifre belirlenirken hata oluştu.",
      "ŞİFRE BELİRLEME HATASI",
    );
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await authService.createDoctor(req.body);

    return res.status(201).json({
      basarili: true,
      mesaj: "Doktor kaydı başarıyla oluşturuldu ve kliniğe bağlandı.",
      doktor: doctor,
    });
  } catch (error) {
    console.error("DOKTOR KAYIT HATASI:", error.message);

    return res.status(error.status || 500).json({
      basarili: false,
      mesaj: error.status
        ? error.message
        : "Doktor kaydı sırasında bir hata oluştu.",
      ...(error.status
        ? {}
        : {
            hata: error.errors
              ? error.errors.map((e) => e.message)
              : error.message,
          }),
    });
  }
};
