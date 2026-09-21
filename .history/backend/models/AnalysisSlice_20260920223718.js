// models/AnalysisSlice.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AnalysisSlice = sequelize.define('AnalysisSlice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    analiz_id: { type: DataTypes.INTEGER, allowNull: false },
    goruntu_yolu: { type: DataTypes.STRING(500), allowNull: false },
    maske_yolu: { type: DataTypes.STRING(500) },
    patoloji_yuzdesi: { type: DataTypes.DECIMAL(5,2) },
    max_olasilik: { type: DataTypes.DECIMAL(5,4) },
    dice_skoru: { type: DataTypes.DECIMAL(5,4) },
    iou_skoru: { type: DataTypes.DECIMAL(5,4) },
    precision_skoru: { type: DataTypes.DECIMAL(5,4) },
    recall_skoru: { type: DataTypes.DECIMAL(5,4) },
    sira_no: { type: DataTypes.INTEGER, allowNull: false },
    alan_mm2: { type: DataTypes.FLOAT(10,2) },
    cevre_mm: { type: DataTypes.FLOAT(10,2) },
    guven_skoru: { type: DataTypes.Float(5,4) }
}, {
    tableName: 'analysis_slices',
    timestamps: false
});

module.exports = AnalysisSlice;