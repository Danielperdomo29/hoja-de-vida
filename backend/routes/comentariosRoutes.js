const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentariosController');

router.post('/', comentariosController.crearComentario);
router.get('/', comentariosController.obtenerComentarios);

module.exports = router;