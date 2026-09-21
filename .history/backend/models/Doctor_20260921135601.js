const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Clinic = require('./Clinic'); // klinik modelin varsa

const Doctor = sequelize.define('Doctor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' }
    },
    klinik_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'clinics', key: 'id' }
    },
    unvan: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['Prof.Dr', 'Doc.Dr', 'Dr', 'Uzm.Dr']]
        }
    },
    uzmanlik: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['Noroloji', 'Uroloji', 'Radyoloji', 'Onkoloji']]
        }
    },
    organ: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['beyin', 'bobrek']]
        }
    },
    biyografi: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'doctors',
    timestamps: false
});

// İlişkiler
Doctor.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Doctor, { foreignKey: 'user_id' });

module.exports = Doctor;