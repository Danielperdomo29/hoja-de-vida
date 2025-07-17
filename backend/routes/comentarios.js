const express = require("express");
const router = express.Router();
const Comentario = require("../models/Comentarios");

const palabrasProhibidas = ["estúpido", "idiota", "imbécil", "tonto", "maldito", "hdp", "puto"]; // Puedes expandir

function contieneOfensas(texto) {
  const minusculas = texto.toLowerCase();
  return palabrasProhibidas.some(p => minusculas.includes(p));
}

router.post("/", async (req, res) => {
  const { contenido, usuario } = req.body;

  if (!contenido || !usuario) {
    return res.status(400).json({ error: "Comentario o usuario faltante" });
  }

  const ofensivo = contieneOfensas(contenido);

  const nuevoComentario = new Comentario({
    contenido,
    usuario,
    aprobado: !ofensivo
  });

  try {
    await nuevoComentario.save();
    res.status(200).json({ mensaje: ofensivo ? "Comentario pendiente por revisión." : "Comentario publicado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

router.get("/", async (req, res) => {
  const comentarios = await Comentario.find({ aprobado: true }).sort({ fecha: -1 });
  res.json(comentarios);
});

module.exports = router;
