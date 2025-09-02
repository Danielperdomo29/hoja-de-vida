const Comentario = require('../models/Comentario');

const palabrasProhibidas = ["estúpido", "idiota", "imbécil", "tonto", "maldito", "hdp", "puto","gonorrea"];

function contieneOfensas(texto) {
  const minusculas = texto.toLowerCase();
  return palabrasProhibidas.some(p => minusculas.includes(p));
}

exports.crearComentario = async (req, res) => {
  try {
    const { contenido } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ 
        error: "Debes iniciar sesión para comentar",
        loginUrl: "/api/auth/google"
      });
    }

    if (!contenido) {
      return res.status(400).json({ error: "El contenido es obligatorio" });
    }

    const ofensivo = contieneOfensas(contenido);

    const nuevoComentario = new Comentario({
      usuario: {
        id: req.user.id,
        nombre: req.user.nombre,
        correo: req.user.correo,
        avatar: req.user.avatar
      },
      contenido,
      aprobado: !ofensivo,
      fecha: new Date()
    });

    await nuevoComentario.save();

    res.status(200).json({ 
      mensaje: ofensivo 
        ? "Comentario pendiente por revisión" 
        : "Comentario publicado con éxito"
    });

  } catch (error) {
    console.error("Error al guardar comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
};

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