const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendPatientInvitation = async ({
  email,
  ad,
  soyad,
  inviteLink,
}) => {
  const fullName = `${ad || ""} ${soyad || ""}`.trim();

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "PathoVision Hesap Aktivasyonu",

    text: `
Merhaba ${fullName},

PathoVision sistemine hasta olarak kaydınız oluşturuldu.

Hesabınızı aktifleştirmek ve şifrenizi belirlemek için aşağıdaki bağlantıyı kullanabilirsiniz:

${inviteLink}

Bu bağlantı 7 gün boyunca geçerlidir.

PathoVision
    `.trim(),

    html: `
      <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        font-family: Arial, sans-serif;
        color: #293548;
      ">
        <h2 style="
          margin-bottom: 20px;
          color: #172033;
        ">
          PathoVision
        </h2>

        <p>Merhaba <strong>${fullName}</strong>,</p>

        <p>
          PathoVision sistemine hasta olarak kaydınız oluşturuldu.
        </p>

        <p>
          Hesabınızı aktifleştirmek ve şifrenizi belirlemek için
          aşağıdaki butona tıklayın.
        </p>

        <div style="margin: 28px 0;">
          <a
            href="${inviteLink}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #0e7490;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Şifremi Oluştur
          </a>
        </div>

        <p style="
          font-size: 14px;
          color: #64748b;
        ">
          Bu bağlantı 7 gün boyunca geçerlidir.
        </p>

        <p style="
          margin-top: 28px;
          font-size: 14px;
          color: #64748b;
        ">
          PathoVision
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendPatientInvitation,
};