const axios = require('axios');
const db = require('./db');

const getClima = async (ciudad) => {
    const ciudadnormalizada = (ciudad && typeof ciudad === 'string') ? ciudad.trim().toLowerCase() : '';
    if (!ciudadnormalizada) {
        throw new Error('la ciudad requerida es invalida o no fue enviada');
    }

    const cacheQuery = 'SELECT * FROM clima WHERE LOWER(ciudad) = $1 AND fecha > NOW() - INTERVAL \'10 minutes\' ORDER BY fecha DESC LIMIT 1';
    const cacheResult = await db.query(cacheQuery, [ciudadnormalizada]);

    if (cacheResult.rows.length > 0) {
        console.log('Datos obtenidos de la cache');
        return{
            source: 'database',
            data: cacheResult.rows[0]
        };
    }

    console.log('Consultando API para ${ciudadnormalizada}');
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        const { main, weather, name } = response.data;
        const insertQuery = 'INSERT INTO clima (ciudad, temperatura, humedad, descripcion) VALUES ($1, $2, $3, $4) RETURNING *';
        const insertResult = await db.query(insertQuery, [name, main.temp, main.humidity, weather[0].description]);
        return {
            source: 'api',
            data: insertResult.rows[0]
        };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error(`Ciudad ${ciudad} no encontrada`);
        }
        throw new Error('Error al obtener datos del clima: ' + error.message);
    }
        }

    module.exports = { getClima };