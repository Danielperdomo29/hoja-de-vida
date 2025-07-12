// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err.message));

// Esquema y modelo de mensaje
const mensajeSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  mensaje: String,
  fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model("Mensaje", mensajeSchema);

// Ruta de envío
app.post("/enviar-correo", async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    // Guardar mensaje en MongoDB
    const nuevoMensaje = new Mensaje({ nombre, correo, mensaje });
    await nuevoMensaje.save();

    // Configurar y enviar correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CORREO,
        pass: process.env.CLAVE
      }
    });

    const mailOptions = {
      from: `"${nombre}" <${correo}>`,
      to: process.env.CORREO,
      subject: `Mensaje de contacto de ${nombre}`,
      html: `
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${correo}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ mensaje: "Mensaje enviado y guardado correctamente." });

  } catch (error) {
    console.error("❌ Error al procesar el mensaje:", error.message);
    res.status(500).json({ error: "No se pudo procesar tu mensaje." });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
