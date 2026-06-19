const {  Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const initDB = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS clima (
            id SERIAL PRIMARY KEY,
            ciudad VARCHAR(255) NOT NULL,
            temperatura FLOAT NOT NULL,
            humedad INT NOT NULL,
            descripcion VARCHAR(255) NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('Estructura verificada');
    } catch (err) {
        console.error('Error inicializando:', err);
        process.exit(1);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB
};

