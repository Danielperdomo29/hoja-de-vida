const express = require("express");
const router = express.Router();
const { enviarMensaje } = require("../controllers/contactoController");
const rateLimit = require("express-rate-limit");

const contactoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 3,
  message: { error: "Has enviado demasiados mensajes. Intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/enviar", contactoLimiter, enviarMensaje);

module.exports = router;
