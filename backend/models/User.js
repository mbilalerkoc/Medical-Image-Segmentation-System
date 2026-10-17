const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    soyad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    sifre: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rol: {
      type: DataTypes.ENUM("superadmin", "doktor", "hasta"),
      allowNull: false,
    },
    tc_kimlik: {
      type: DataTypes.STRING(11),
    },
    dogum_tarihi: {
      type: DataTypes.DATEONLY,
    },
    telefon: {
      type: DataTypes.STRING(20),
    },
    profil_resmi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dil: {
      type: DataTypes.ENUM("tr", "en"),
      defaultValue: "tr",
    },
    aktif: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

module.exports = User;
