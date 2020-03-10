//Rutas para usuarios
const express = require('express');
const router = express.Router();
const afiliadoController = require('../controllers/afiliadoController');

//Obtener usuarios
router.get('/',
    //afiliadoController.obtenerAfiliado,
    afiliadoController.obtenerPrioridadAfi
);

module.exports = router;