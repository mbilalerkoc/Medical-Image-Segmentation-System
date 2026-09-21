// config/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,     // pathovision
    process.env.DB_USER,     // postgres
    process.env.DB_PASSWORD, // şifren
    {
        host    : process.env.DB_HOST,
        port    : process.env.DB_PORT,
        dialect : 'pg',
        logging : false, // SQL sorgularını terminale yazdırma
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