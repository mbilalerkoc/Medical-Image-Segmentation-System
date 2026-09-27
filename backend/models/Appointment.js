const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    hasta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "id",
      },
    },

    doktor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "doctors",
        key: "id",
      },
    },

    klinik_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clinics",
        key: "id",
      },
    },

    tarih_saat: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    durum: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "bekliyor",
      validate: {
        isIn: [
          [
            "bekliyor",
            "onaylandi",
            "tamamlandi",
            "iptal_edildi",
            "gelmedi",
          ],
        ],
      },
    },

    notlar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    olusturulma_tarihi: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    randevu_nedeni: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    sure_dakika: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 5,
      },
    },
  },
  {
    tableName: "appointments",
    timestamps: false,
  }
);

module.exports = Appointment;