const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  usuario: {
    id: String,
    nombre: String,
    correo: String
  },
  contenido: String,
  fecha: { type: Date, default: Date.now },
  aprobado: { type: Boolean, default: false }
});

module.exports = mongoose.model("Comentario", comentarioSchema);
