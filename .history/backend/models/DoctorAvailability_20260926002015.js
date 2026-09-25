const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DoctorAvailability = sequelize.define(
  "DoctorAvailability",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    doktor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "doctors",
        key: "id",
      },
    },

    gun: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [
          [
            "pazartesi",
            "sali",
            "carsamba",
            "persembe",
            "cuma",
            "cumartesi",
            "pazar",
          ],
        ],
      },
    },

    baslangic_saati: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    bitis_saati: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: "doctor_availability",
    timestamps: false,
  }
);

module.exports = DoctorAvailability;