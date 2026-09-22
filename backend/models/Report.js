const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    analiz_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    hasta_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    doktor_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    pdf_yolu: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    olusturulma_tarihi: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
}, {
    tableName: 'reports',
    timestamps: false
});

module.exports = Report;