const express = require('express');
const db = require('./db');
const climaService = require('./clima-service');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/clima', async (req, res) => {
    const { ciudad } = req.query;
    if (!ciudad) {
        return res.status(400).json({ error: 'Parámetro ciudad es requerido' });
    }
    try {
        const climaData = await climaService.getClima(ciudad);
        return res.json(climaData);
    } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.message.includes('no encontrada')) {
            statusCode = 404;
        }

        return res.status(statusCode).json({
            error: error.message || 'error inesperado en el srv'
        });
    }
});

db.initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en puerto ${PORT}`);
    });
});