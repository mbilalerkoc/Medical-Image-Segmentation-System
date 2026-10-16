const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Notification = sequelize.define(
    "Notification",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        kullanici_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },

        tip: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        seviye: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "info",
            validate: {
                isIn: [["info", "success", "warning", "danger"]],
            },
        },

        konu: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        mesaj: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        link: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },

        okunma_tarihi: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        tarih: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "notifications",
        timestamps: false,
    },
);

module.exports = Notification;