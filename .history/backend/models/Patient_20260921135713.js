const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Kendi db yapılandırma dosyanın yoluna göre uyarla
const User = require('./User');

const Patient = sequelize.define('Patient', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    doktor_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    tc_kimlik: { 
        type: DataTypes.STRING(11), 
        allowNull: false 
    },
    kan_grubu: { 
        type: DataTypes.STRING(5),
        allowNull: true
},
    adres: { 
        type: DataTypes.TEXT 
    }
}, {
    tableName: 'patients',
    timestamps: false
});

// İlişkileri tanımlıyoruz (Patient ve User tablolarını user_id üzerinden bağlıyoruz)
Patient.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Patient, { foreignKey: 'user_id' });

module.exports = Patient;