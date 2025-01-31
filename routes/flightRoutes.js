const express = require('express');
const router = express.Router();
const flightService = require('../services/flightService');

// Példa repülőút keresési útvonal
router.get('/search-flights', async (req, res) => {
    const { origin, destination, date } = req.query;
    if (!origin || !destination || !date) {
        return res.status(400).json({ error: "Hiányzó paraméterek." });
    }

    try {
        const flightData = await flightService.getFlightData(origin, destination, date);
        res.json(flightData);
    } catch (error) {
        console.error("Hiba a repülőút keresése során:", error);
        res.status(500).json({ error: "Nem sikerült repülőjáratot találni." });
    }
});

module.exports = router;
