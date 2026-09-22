const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Klinik = require('./Klinik');
const Doctor = sequelize.define('Doctor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    klinik_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unvan: {
        type: DataTypes.ENUM('Prof.Dr', 'Doc.Dr', 'Dr', 'Uzm.Dr'),
        allowNull: false
    },
    uzmanlik: {
        type: DataTypes.ENUM('Noroloji', 'Uroloji', 'Radyoloji', 'Onkoloji'),
        allowNull: false
    },
    organ: {
        type: DataTypes.ENUM('beyin', 'bobrek'),
        allowNull: false
    },
    biyografi: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'doctors',
    timestamps: false
});

// İlişkileri tanımlıyoruz (Doctor ve User tablolarını user_id üzerinden bağlıyoruz)
Doctor.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Doctor, { foreignKey: 'user_id' });

module.exports = Doctor;