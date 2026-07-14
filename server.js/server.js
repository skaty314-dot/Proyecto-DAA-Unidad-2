const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Habilitar CORS para permitir llamadas externas desde tu dominio de GitHub Pages
app.use(cors());
app.use(express.json());

// Base de datos volátil local en memoria
let solicitudesBase = [
    { usuario: "admin_test", articulo: "Licencia Cloud Premium", cantidad: 2, precioTotal: "500.00", timestamp: "12:00:00" }
];

// Endpoint GET solicitudes
app.get('/solicitudes', (req, res) => {
    console.log("Soporte solicitó lectura de registros.");
    res.json(solicitudesBase);
});

// Endpoint POST solicitudes
app.post('/solicitudes', (req, res) => {
    const nuevaSolicitud = req.body;
    console.log("Nueva solicitud de compra entrante:", nuevaSolicitud);
    
    if (nuevaSolicitud && nuevaSolicitud.usuario && nuevaSolicitud.articulo) {
        solicitudesBase.push(nuevaSolicitud);
        res.status(201).json(nuevaSolicitud);
    } else {
        res.status(400).json({ error: "Datos de solicitud inválidos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de pruebas corriendo de forma segura en: http://localhost:${PORT}`);
});