const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Klinik = sequelize.define('Klinik', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ad: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    adres: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    telefon: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    olusturulma_tari: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'clinics',
    timestamps: false // Tabloda createdAt/updatedAt standart kolonları olmadığı için kapalı tutuyoruz
});

module.exports = Klinik;