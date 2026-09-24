const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Analysis = sequelize.define(
  "Analysis",
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
      allowNull: true,
      references: {
        model: "clinics",
        key: "id",
      },
    },

    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "appointments",
        key: "id",
      },
    },

    analiz_adi: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    organ: {
      type: DataTypes.ENUM("beyin", "bobrek"),
      allowNull: false,
    },

    model: {
      type: DataTypes.ENUM("unet", "unet_plus"),
      allowNull: false,
    },

    durum: {
      type: DataTypes.ENUM(
        "bekliyor",
        "tamamlandi",
        "onaylandi"
      ),
      defaultValue: "bekliyor",
    },
  },
  {
    tableName: "analyses",
    timestamps: false,
  }
);

module.exports = Analysis;