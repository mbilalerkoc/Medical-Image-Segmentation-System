// config/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host    : process.env.DB_HOST,
        port    : process.env.DB_PORT,
        dialect : 'postgres',
        logging : false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('🗄️  PostgreSQL Bağlantısı Başarılı!');
    } catch (error) {
        console.error('❌ PostgreSQL Bağlantı Hatası:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };