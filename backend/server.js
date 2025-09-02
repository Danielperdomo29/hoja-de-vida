require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const MongoStore = require("connect-mongo"); // npm i connect-mongo

const app = express();
const PORT = process.env.PORT || 3000;

// === Helmet + CSP consolidado ===
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"], // evita 'unsafe-inline' si mueves inline styles
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://d33wubrfki0l68.cloudfront.net", "https://lh3.googleusercontent.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://www.googleapis.com"],
    }
  }
}));

// === Rate limit global para /api ===
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// === CORS ===
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// === Parsers ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Session (usar MongoStore en producción) ===
const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' });
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecreto",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// === Passport ===
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// === Conexión a Mongo ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// === Rutas ===
const authRoutes = require("./routes/authRoutes");
const comentariosRoutes = require("./routes/comentariosRoutes");
const contactoRoutes = require("./routes/contactoRoutes");
const contactoController = require("./controllers/contactoController");

app.use("/api/auth", authRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/contacto", contactoRoutes);

// Alias para compatibilidad con frontend estático que use /enviar-correo
app.post("/enviar-correo", contactoController.enviarMensaje);

// === Estáticos ===
app.use(express.static(path.join(__dirname, "public")));

// Catch-all GET -> index.html (no afecta POST)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manejo de errores global (al final)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
