const { Op } = require("sequelize");

const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Analysis = require("../models/Analysis");
const Report = require("../models/Report");
const Appointment = require("../models/Appointment");

// =====================================================
// DASHBOARD
// GET /api/dashboard
// =====================================================

exports.getDashboard = async (req, res) => {
  try {
    // =====================================================
    // 1. DOKTOR
    // =====================================================

    const doctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        basarili: false,
        mesaj: "Doktor kaydı bulunamadı.",
      });
    }

    const now = new Date();

    // Bugünün başlangıcı
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Yarının başlangıcı
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // =====================================================
    // 2. DASHBOARD SAYILARI
    // =====================================================

    const [
      toplamHasta,
      toplamAnaliz,
      tamamlananAnaliz,
      bekleyenAnaliz,
      bugunkuRandevu,
      yaklasanRandevu,
    ] = await Promise.all([
      // Toplam hasta
      Patient.count({
        where: {
          doktor_id: doctor.id,
        },
      }),

      // Toplam analiz
      Analysis.count({
        where: {
          doktor_id: doctor.id,
        },
      }),

      // Tamamlanan analiz
      Analysis.count({
        where: {
          doktor_id: doctor.id,

          durum: {
            [Op.in]: [
              "tamamlandi",
              "onaylandi",
            ],
          },
        },
      }),

      // Bekleyen analiz
      Analysis.count({
        where: {
          doktor_id: doctor.id,
          durum: "bekliyor",
        },
      }),

      // Bugünkü randevular
      Appointment.count({
        where: {
          doktor_id: doctor.id,

          tarih_saat: {
            [Op.gte]: todayStart,
            [Op.lt]: todayEnd,
          },

          durum: {
            [Op.ne]: "iptal_edildi",
          },
        },
      }),

      // Yaklaşan randevular
      Appointment.count({
        where: {
          doktor_id: doctor.id,

          tarih_saat: {
            [Op.gte]: now,
          },

          durum: {
            [Op.ne]: "iptal_edildi",
          },
        },
      }),
    ]);

    // =====================================================
    // 3. SON ANALİZLER
    // =====================================================

    const analyses = await Analysis.findAll({
      where: {
        doktor_id: doctor.id,
      },

      order: [
        ["id", "DESC"],
      ],

      limit: 6,
    });

    // =====================================================
    // 4. BUGÜNKÜ RANDEVULAR
    // =====================================================

    const appointments =
      await Appointment.findAll({
        where: {
          doktor_id: doctor.id,

          tarih_saat: {
            [Op.gte]: todayStart,
            [Op.lt]: todayEnd,
          },

          durum: {
            [Op.ne]: "iptal_edildi",
          },
        },

        order: [
          ["tarih_saat", "ASC"],
        ],

        limit: 6,
      });

    // =====================================================
    // 5. GEREKLİ HASTALARI TOPLA
    // =====================================================

    const patientIds = [
      ...new Set([
        ...analyses.map(
          (analysis) =>
            analysis.hasta_id
        ),

        ...appointments.map(
          (appointment) =>
            appointment.hasta_id
        ),
      ]),
    ];

    let patients = [];

    if (patientIds.length > 0) {
      patients =
        await Patient.findAll({
          where: {
            id: {
              [Op.in]: patientIds,
            },
          },

          include: [
            {
              model: User,

              attributes: [
                "ad",
                "soyad",
                "telefon",
              ],
            },
          ],
        });
    }

    // =====================================================
    // 6. HASTA MAP
    // =====================================================

    const patientMap = {};

    patients.forEach((patient) => {
      patientMap[patient.id] =
        patient;
    });

    // =====================================================
    // 7. ANALİZ RAPORLARI
    // =====================================================

    const analysisIds =
      analyses.map(
        (analysis) =>
          analysis.id
      );

    let reports = [];

    if (analysisIds.length > 0) {
      reports =
        await Report.findAll({
          where: {
            analiz_id: {
              [Op.in]:
                analysisIds,
            },
          },

          order: [
            [
              "olusturulma_tarihi",
              "DESC",
            ],
          ],
        });
    }

    const reportMap = {};

    reports.forEach((report) => {
      if (
        !reportMap[
          report.analiz_id
        ]
      ) {
        reportMap[
          report.analiz_id
        ] = report;
      }
    });

    // =====================================================
    // 8. SON ANALİZLER RESPONSE
    // =====================================================

    const sonAnalizler =
      analyses.map(
        (analysis) => {
          const patient =
            patientMap[
              analysis.hasta_id
            ];

          const report =
            reportMap[
              analysis.id
            ];

          return {
            id:
              analysis.id,

            analiz_adi:
              analysis.analiz_adi ||
              `Analiz #${analysis.id}`,

            hasta_id:
              analysis.hasta_id,

            hasta_adi:
              patient?.User
                ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
                : "-",

            tc_kimlik:
              patient?.tc_kimlik ||
              "-",

            organ:
              analysis.organ,

            model:
              analysis.model,

            durum:
              analysis.durum,

            tarih:
              report?.olusturulma_tarihi ||
              analysis.olusturulma_tarihi,
          };
        }
      );

    // =====================================================
    // 9. BUGÜNKÜ RANDEVULAR RESPONSE
    // =====================================================

    const bugunkuRandevular =
      appointments.map(
        (appointment) => {
          const patient =
            patientMap[
              appointment.hasta_id
            ];

          return {
            id:
              appointment.id,

            hasta_id:
              appointment.hasta_id,

            hasta_adi:
              patient?.User
                ? `${patient.User.ad || ""} ${patient.User.soyad || ""}`.trim()
                : "-",

            tc_kimlik:
              patient?.tc_kimlik ||
              "-",

            telefon:
              patient?.User?.telefon ||
              null,

            tarih_saat:
              appointment.tarih_saat,

            sure_dakika:
              appointment.sure_dakika,

            randevu_nedeni:
              appointment.randevu_nedeni,

            durum:
              appointment.durum,
          };
        }
      );

    // =====================================================
    // 10. RESPONSE
    // =====================================================

    return res.status(200).json({
      basarili: true,

      istatistikler: {
        toplam_hasta:
          toplamHasta,

        toplam_analiz:
          toplamAnaliz,

        tamamlanan_analiz:
          tamamlananAnaliz,

        bekleyen_analiz:
          bekleyenAnaliz,

        bugunku_randevu:
          bugunkuRandevu,

        yaklasan_randevu:
          yaklasanRandevu,
      },

      son_analizler:
        sonAnalizler,

      bugunku_randevular:
        bugunkuRandevular,
    });

  } catch (error) {
    console.error(
      "Dashboard hatası:",
      error
    );

    return res.status(500).json({
      basarili: false,
      mesaj:
        "Dashboard bilgileri alınırken bir hata oluştu.",
    });
  }
};