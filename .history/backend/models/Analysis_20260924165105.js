const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Analysis = sequelize.define('Analysis', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hasta_id: { type: DataTypes.INTEGER, allowNull: false },
    doktor_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'users', // Veritabanındaki kullanıcılar tablosunun tam adı
            key: 'id'
        }
    },
    klinik_id: { type: DataTypes.INTEGER }, 
    appointment_id: { type: DataTypes.INTEGER }, 
    organ: { type: DataTypes.ENUM('beyin', 'bobrek'), allowNull: false },
    model: { type: DataTypes.ENUM('unet', 'unet_plus'), allowNull: false },
    durum: { type: DataTypes.ENUM('bekliyor', 'tamamlandi', 'onaylandi'), defaultValue: 'bekliyor' }
}, {
    tableName: 'analyses',
    timestamps: false
});

module.exports = Analysis;