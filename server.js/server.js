const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Habilitar CORS para permitir peticiones desde tu GitHub Pages (u otros orígenes)
app.use(cors());
app.use(express.json());

// Base de datos volátil en memoria local
let solicitudesDb = [
    { usuario: "sistema.automatico@empresa.com", inicio: 1, fin: 3, tokenOrder: 2 },
    { usuario: "empleado.uno@empresa.com", inicio: 3, fin: 6, tokenOrder: 1 }
];

// GET: Obtener todas las solicitudes
app.get('/solicitudes', (req, res) => {
    console.log("Petición GET recibida. Enviando solicitudes...");
    res.json(solicitudesDb);
});

// POST: Registrar una nueva solicitud
app.post('/solicitudes', (req, res) => {
    const nuevaSolicitud = req.body;
    console.log("Petición POST recibida:", nuevaSolicitud);
    
    if (nuevaSolicitud && nuevaSolicitud.usuario) {
        solicitudesDb.push(nuevaSolicitud);
        res.status(201).json(nuevaSolicitud);
    } else {
        res.status(400).json({ error: "Datos de solicitud inválidos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de DAA corriendo localmente en http://localhost:${PORT}`);
});