

const { verificarCaptcha } = require("../utils/captcha");
const Comentario = require("../models/Comentario");

// Palabras prohibidas normalizadas (sin tildes, sin espacios especiales)
// Lista optimizada de palabras prohibidas (sin duplicados y organizada)
const palabrasProhibidas = require("../config/palabrasProhibidas.json");


// Mapa para detectar leetspeak
const leetMap = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "+": "t"
};

function desleet(texto) {
  return texto.split("").map(c => leetMap[c] || c).join("");
}

// Normaliza: minúsculas, sin acentos, convierte leet y deja solo letras/números
function normalizarTexto(texto) {
  return desleet(
    texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
  ).replace(/[^a-z0-9ñ]/g, ""); // quita símbolos
}

// Revisa si contiene palabras prohibidas
function contieneOfensas(texto, listaProhibidas) {
  const limpio = normalizarTexto(texto);
  return listaProhibidas.some(p => limpio.includes(normalizarTexto(p)));
}

function contieneXSS(texto) {
  const xssRegex = /<script|<\/script|onerror=|onload=|javascript:|data:text\/html/i;
  return xssRegex.test(texto);
}

// --- Función central para sanitizar ---
function sanitizeComentario(texto, listaProhibidas) {
  if (contieneXSS(texto)) {
    return { valido: false, motivo: "XSS detectado" };
  }

  if (contieneOfensas(texto, listaProhibidas)) {
    return { valido: false, motivo: "Lenguaje ofensivo detectado" };
  }

  // si pasa filtros, devuelve normalizado
  return { valido: true, limpio: normalizarTexto(texto) };
}

// --- Controlador crearComentario ---
exports.crearComentario = async (req, res) => {
  try {
    const { contenido, captcha } = req.body;

    if (!req.user) {
      return res.status(401).json({
        error: "Debes iniciar sesión para comentar",
        loginUrl: "/api/auth/google"
      });
    }

    if (!contenido) {
      return res.status(400).json({ error: "El contenido es obligatorio" });
    }

    // 🔐 Verificar Captcha antes de todo
    const captchaValido = await verificarCaptcha(captcha);
    if (!captchaValido) {
      return res.status(400).json({ error: "⚠️ Verificación reCAPTCHA fallida." });
    }

    // Validar y sanitizar
    const resultado = sanitizeComentario(contenido, palabrasProhibidas);

    if (!resultado.valido) {
      return res.status(400).json({
        error: `🚫 Tu comentario no fue aceptado: ${resultado.motivo}`
      });
    }

    const nuevoComentario = new Comentario({
      usuario: {
        id: req.user.id,
        nombre: req.user.nombre,
        correo: req.user.correo,
        avatar: req.user.avatar
      },
      contenido, // se guarda original, pero ya validado
      aprobado: true,
      fecha: new Date()
    });

    await nuevoComentario.save();

    res.status(200).json({
      mensaje: "✅ Comentario publicado con éxito"
    });

  } catch (error) {
    console.error("Error al guardar comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
};

// --- Controlador obtenerComentarios ---
exports.obtenerComentarios = async (req, res) => {
  try {
    const comentarios = await Comentario.find({ aprobado: true })
      .sort({ fecha: -1 })
      .limit(50);

    res.json(comentarios);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
};
