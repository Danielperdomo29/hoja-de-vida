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
const validator = require('validator');
// Ruta de envío
app.post("/enviar-correo", async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  
if (!validator.isEmail(correo)) {
  return res.status(400).json({ error: "Correo electrónico inválido." });
}

if (nombre.length > 100 || correo.length > 100 || mensaje.length > 1000) {
  return res.status(400).json({ error: "Los campos exceden el tamaño permitido." });
}


// Sanitizar para evitar inyección XSS
  nombre = validator.escape(nombre);
  correo = validator.normalizeEmail(correo);
  mensaje = validator.escape(mensaje);

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
    from: process.env.CORREO,        // tu correo real, el que usas para enviar
    replyTo: correo,                 // correo del usuario que te contactó
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

const session = require("express-session");
const passport = require("passport");

require("./auth/google"); // Importar estrategia Google

app.use(session({
  secret: "tu_clave_secreta",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/"); // Redirige al inicio o a donde desees
  }
);

// Ruta logout
app.get("/logout", (req, res) => {
  req.logout(err => {
    res.redirect("/");
  });
});

app.get("/api/usuario", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  res.json(req.user);
});


// Rutas protegidas (comentarios)
const comentariosRoutes = require("./routes/comentarios");
app.use("/comentarios", comentariosRoutes);



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
