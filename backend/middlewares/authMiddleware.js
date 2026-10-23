const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      basarili: false,
      mesaj: "Lütfen giriş yapın.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await userRepository.findById(decoded.id, {
      exclude: ["sifre"],
    });

    if (!req.user) {
      return res.status(401).json({
        basarili: false,
        mesaj: "Bu tokena ait kullanıcı bulunamadı.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      basarili: false,
      mesaj: "Geçersiz veya süresi dolmuş token.",
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        basarili: false,
        mesaj: `Bu işlemi yapmaya yetkiniz yok. Gerekli rol: ${roles.join(" veya ")}`,
      });
    }

    next();
  };
};
