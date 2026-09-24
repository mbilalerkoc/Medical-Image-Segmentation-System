const { Op } = require("sequelize");

const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Analysis = require("../models/Analysis");
const Report = require("../models/Report");

exports.getDashboard = async (req, res) => {
  try {
    // =====================================================
    // GİRİŞ YAPAN DOKTORU BUL
    // =====================================================

    const doctor = await Doctor.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!doctor) {
      return res.status(403).json({
        basarili: false,
        mesaj: "Doktor profili bulunamadı.",
      });
    }

    // =====================================================
    // İSTATİSTİKLER + SON 6 ANALİZ
    // =====================================================

    const [
      toplamHasta,
      toplamAnaliz,
      tamamlananAnaliz,
      bekleyenAnaliz,
      recentAnalyses,
    ] = await Promise.all([
      Patient.count({
        where: {
          doktor_id: doctor.id,
        },
      }),

      Analysis.count({
        where: {
          doktor_id: doctor.id,
        },
      }),

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

      Analysis.count({
        where: {
          doktor_id: doctor.id,
          durum: "bekliyor",
        },
      }),

      Analysis.findAll({
        where: {
          doktor_id: doctor.id,
        },

        order: [
          ["id", "DESC"],
        ],

        limit: 6,
      }),
    ]);

    // =====================================================
    // SON ANALİZLERDEKİ HASTALARI TOPLA
    // =====================================================

    const patientIds = [
      ...new Set(
        recentAnalyses.map(
          (analysis) => analysis.hasta_id
        )
      ),
    ];

    let patients = [];

    if (patientIds.length > 0) {
      patients = await Patient.findAll({
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
            ],
          },
        ],
      });
    }

    // =====================================================
    // RAPOR TARİHLERİNİ GETİR
    // =====================================================

    const analysisIds =
      recentAnalyses.map(
        (analysis) => analysis.id
      );

    let reports = [];

    if (analysisIds.length > 0) {
      reports = await Report.findAll({
        where: {
          analiz_id: {
            [Op.in]: analysisIds,
          },
        },

        order: [
          ["id", "DESC"],
        ],
      });
    }

    // =====================================================
    // HASTA MAP
    // =====================================================

    const patientMap = {};

    patients.forEach((patient) => {
      patientMap[patient.id] = patient;
    });

    // =====================================================
    // HER ANALİZİN EN SON RAPORUNU BUL
    // =====================================================

    const reportMap = {};

    reports.forEach((report) => {
      if (!reportMap[report.analiz_id]) {
        reportMap[report.analiz_id] =
          report;
      }
    });

    // =====================================================
    // SON ANALİZLERİ FORMATLA
    // =====================================================

    const sonAnalizler =
      recentAnalyses.map(
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

            hasta:
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
              null,
          };
        }
      );

    // =====================================================
    // RESPONSE
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
      },

      son_analizler:
        sonAnalizler,
    });

  } catch (error) {
    console.error(
      "DASHBOARD HATASI:",
      error.message
    );

    return res.status(500).json({
      basarili: false,

      mesaj:
        "Dashboard bilgileri alınamadı.",

      hata:
        error.message,
    });
  }
};