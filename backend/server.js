const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const crypto = require("crypto"); // Para generar secreto si es necesario

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Verificar SESSION_SECRET o generar uno temporal
if (!process.env.SESSION_SECRET) {
  const tempSecret = crypto.randomBytes(64).toString('hex');
  console.warn("⚠️  SESSION_SECRET no definido. Usando secreto temporal:", tempSecret);
  process.env.SESSION_SECRET = tempSecret;
}

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de la estrategia Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  (request, accessToken, refreshToken, profile, done) => {
    // Formatear el usuario
    return done(null, {
      id: profile.id,
      nombre: profile.displayName,
      correo: profile.emails[0].value
    });
  }
));

// Serialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

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

// Ruta de envío de correo
app.post("/enviar-correo", async (req, res) => {
  let { nombre, correo, mensaje } = req.body;

  // Validaciones
  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  
  if (!validator.isEmail(correo)) {
    return res.status(400).json({ error: "Correo electrónico inválido." });
  }

  if (nombre.length > 100 || correo.length > 100 || mensaje.length > 1000) {
    return res.status(400).json({ error: "Los campos exceden el tamaño permitido." });
  }

  // Sanitización
  nombre = validator.escape(nombre);
  correo = validator.normalizeEmail(correo);
  mensaje = validator.escape(mensaje);

  try {
    // Guardar en MongoDB
    const nuevoMensaje = new Mensaje({ nombre, correo, mensaje });
    await nuevoMensaje.save();

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CORREO,
        pass: process.env.CLAVE.replace(/\s+/g, '') // Eliminar espacios si existen
      }
    });

    const mailOptions = {
      from: process.env.CORREO,
      replyTo: correo,
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
    console.error("❌ Error al procesar el mensaje:", error);
    res.status(500).json({ error: "No se pudo procesar tu mensaje." });
  }
});

// Rutas de autenticación
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/#comentarios?error=auth',
    successRedirect: '/#comentarios?success=auth'
  })
);

// Ruta logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ error: "Error al cerrar sesión" });
    }
    res.redirect("/");
  });
});

// Obtener usuario actual
app.get("/api/usuario", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  res.json(req.user);
});

// Rutas de comentarios
const comentariosRoutes = require("./routes/comentarios");
app.use("/comentarios", comentariosRoutes);

// Endpoint de diagnóstico
app.get("/server-info", (req, res) => {
  res.json({
    status: "online",
    googleAuthConfigured: !!passport._strategies.google,
    sessionSecretSet: !!process.env.SESSION_SECRET,
    environment: process.env.NODE_ENV || "development"
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log("🔑 Longitud SESSION_SECRET:", process.env.SESSION_SECRET?.length || "No definido");
});