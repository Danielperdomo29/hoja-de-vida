

const { verificarCaptcha } = require("../utils/captcha");
const Comentario = require("../models/Comentario");

// Palabras prohibidas normalizadas (sin tildes, sin espacios especiales)
// Lista optimizada de palabras prohibidas (sin duplicados y organizada)
const palabrasProhibidas = [
  // Insultos y groserías básicas
  "arrecostes", "arrecostés", "asesina", "asesinas", "asesino", "asesinos", "asquerosa", "asqueroso", 
  "bastarda", "bastardo", "bestia", "bestias", "bolas", "bruta", "bruto", "bufon", "bufones", 
  "cabrona", "cabronas", "cabronazo", "cabronazos", "cabrón", "cabrones", "cabron", "cacorra", 
  "cacorras", "cacorro", "cacorros", "cagada", "cagadas", "cagado", "cagados", "cagais", "cagamos", 
  "cagando", "cagan", "cagara", "cagar", "cagaron", "cagarro", "cagarros", "cagas", "cagaste", 
  "cagoen", "cagoenla", "cagoenlas", "cagoenle", "cagoenles", "cagoenlo", "cagoenlos", "cagoentoda", 
  "cagoentodas", "cagoentodo", "cagoentodos", "canalla", "canallas", "caraculo", "carajo", "carajos", 
  "carapapa", "carajote", "cenutrio", "cerda", "cerdo", "chichona", "chichonas", "chinga", "chingada", 
  "chingadas", "chingado", "chingados", "chingar", "chinguen", "chupadora", "chupadoras", "chupador", 
  "chupadores", "chupamedias", "chupamela", "chupamelas", "chupamelo", "chupamelos", "chupapijas", 
  "chupapollas", "chupasangre", "chupoptero", "chusma", "cochina", "cochino", "cojida", "cojido", 
  "comemierda", "comunista", "comunistas", "concha", "conchadetumadre", "conchas", "conchita", 
  "conchito", "conchudas", "conchudo", "conchudos", "coño", "coños", "creida", "creido", "culera", 
  "culeras", "culero", "culeros", "culerazo", "culerazos", "culiao", "culiaos", "culiá", "culiado", 
  "culiados", "culiáo", "culiáos", "culia", "culias", "culiás", "culo", "culos", "culito", "culitos", 
  "desgraciada", "desgraciado", "desleal", "drogadicta", "drogadictas", "drogadicto", "drogadictos", 
  "drogata", "drogatas", "drogon", "drogona", "drogonas", "drogones", "energumeno", "esclava", 
  "esclavo", "escoria", "estupida", "estupidas", "estupido", "estupidos", "facha", "fascista", 
  "fascistas", "feto", "fulana", "furcia", "gañan", "gilipolla", "gilipollas", "gilipollo", 
  "gilipollos", "gilipuertas", "gonorrea", "gorda", "gordo", "granuja", "granujas", "grosera", 
  "grosero", "hdp", "heroina", "heroinas", "heroinomana", "heroinomanas", "heroinomano", "heroinomanos", 
  "hijaputa", "hijaputas", "hijodeputa", "hijoputa", "hijoputas", "hijueputa", "hijueputas", 
  "hijueputo", "hijueputos", "holgazan", "hostia", "hostias", "hostion", "hostiones", "idiota", 
  "idiotas", "imbecil", "imbecila", "imbecilas", "imbeciles", "inculto", "indeseable", "infiel", 
  "jodida", "jodidas", "jodido", "jodidos", "joder", "jodete", "jodetela", "jodetelas", "jodetelo", 
  "jodetelos", "jodetoda", "jodetodas", "jodetodo", "jodetodos", "ladrona", "ladronas", "ladrón", 
  "ladrones", "lameculo", "lameculos", "lameculi", "lameculia", "lameculiao", "lameculiaos", 
  "lameculias", "lameculiado", "lameculiados", "lameculiada", "lameculiadas", "lameculis", "lamer", 
  "lamida", "lamidas", "lamido", "lamidos", "lesbiana", "lesbianas", "lesbiano", "macarra", "mala", 
  "malas", "maldita", "malditas", "maldito", "malditos", "malnacido", "malo", "malos", "malparida", 
  "malparidas", "malparido", "malparidos", "mamahueva", "mamahuevas", "mamahuevo", "mamahuevos", 
  "mamapolla", "mamapollas", "mamon", "mamona", "mamonas", "mamonazo", "mamonazos", "marihuana", 
  "marihuanas", "marihuanera", "marihuaneras", "marihuanero", "marihuaneros", "marica", "maricas", 
  "maricon", "maricona", "mariconas", "mariconazo", "mariconazos", "maricones", "maricon", "maricón",
  "mariquita", "mastuerzo", "mecagoendios", "mecagoentodo", "mecagoentumadre", "mequetrefe", "mierda", 
  "mierdas", "mierdera", "mierdero", "mierderos", "mk", "mocosa", "mocoso", "morrongo", "mugrienta", 
  "mugriento", "nob", "nobe", "nobes", "nobs", "nula", "nulas", "nulo", "nulos", "ostia", "ostias", 
  "ostion", "ostiones", "pagafantas", "pajera", "pajero", "pajilla", "panocha", "panochas", "pans", 
  "pata", "patas", "pato", "patos", "pendeja", "pendejas", "pendejo", "pendejos", "perra", "perras", 
  "perro", "perros", "pesima", "pesimo", "piltrafa", "pinche", "pinga", "piojosa", "piojoso", "poca", 
  "polla", "pollas", "potorro", "prepotente", "prostituta", "prostitutas", "puta", "putas", "puto", 
  "putos", "ramera", "ratera", "rateras", "ratero", "rateros", "retrasada", "retrasado", "rojo", 
  "rufian", "sarnosa", "sarnoso", "soplapollas", "soplon", "soplona", "soplones", "soplonas", "suicida", 
  "suicidas", "tarada", "tarado", "tonta", "tontas", "tonto", "tontos", "trol", "trola", "trolas", 
  "trole", "troles", "troll", "trolls", "trolazo", "trolazos", "verga", "vergas", "vergon", "vergones", 
  "vergonza", "vergonzas", "vergonazo", "vergonazos", "violadora", "violadoras", "violador", "violadores", 
  "zopenco", "zorras", "zorro", "zorros", "zoquete",
  
  // Términos relacionados con drogas
  "bazuco", "bazuquera", "bazuqueras", "bazuquero", "bazuqueros", "coca", "cocaina", "cocainas", 
  "cocainomana", "cocainomanas", "cocainomano", "cocainomanos", "cocas", "mariguana", "mariguanas", 
  "mariguano", "mariguanos", "mariuanera", "mariuaneras", "mariuanero", "mariuaneros", "opio", "paco", 
  "paca", "pacos", "pac", "pepas", "perica", "pericas", "perico", "pericos", "peta", "petas", "petardo", 
  "petardos", "tusi", "tussi", "tuzi",
  
  // Términos de orientación sexual (usados de manera despectiva)
  "gay", "homosexual", "homosexualidad", "lesbiana", "lesbiano",
  
  // Términos relacionados con alcohol
  "alcoholica", "alcoholicas", "alcoholico", "alcoholicos", "alcohólica", "alcohólicas", "alcohólico", 
  "alcohólicos", "borracha", "borrachas", "borracho", "borrachos",
  
  // Palabras de discriminación por capacidad
  "retrasada", "retrasado", "retrasados", "retrasadas",
  
  // Términos de discriminación por apariencia
  "enana", "enanas", "enano", "enanos", "enanita", "enanitas", "enanito", "enanos", "fea", "feo", "gorda", 
  "gordo", "gordas", "gordos",
  
  // Términos de discriminación por edad
  "vejestorio", "vejestorios",
  
  // Términos de discriminación por condición social
  "pagado", "pagada", "pringao", "pringaos",
  
  // Términos de discriminación por nacionalidad/origen
  "paleto", "paletos", "cateto", "catetos",
  
  // Expresiones despectivas varias
  "abollao", "abollados", "alcoholico", "alcoholicos", "analfabeto", "analfabetos", "animal", "animales", 
  "apestada", "apestadas", "apestado", "apestados", "apestosa", "apestoso", "arrastrada", "arrastradas", 
  "arrastrado", "arrastrados", "baj", "bajo", "basura", "basuras", "basurera", "basureras", "basurero", 
  "basureros", "bobalicon", "bobalicona", "capitalista", "capitalistas", "carrozas", "cero", "chiquita", 
  "chiquito", "chiquitas", "chiquitos", "chivata", "chivatas", "chivato", "chivatos", "chupada", "chupado", 
  "colgada", "colgadas", "colgado", "colgados", "colgao", "colgaos", "culion", "cutre", "despreciable", 
  "despreciables", "esqueleto", "esqueletos", "fascista", "fascistas", "feto", "fetos", "fumador", 
  "fumadora", "fumadoras", "fumadores", "fumeta", "fumetas", "gandul", "gandules", "garrula", "garrulo", 
  "giganton", "golfa", "golfas", "grasienta", "grasiento", "guardia", "guardias", "hipocrita", "hipocritas", 
  "holgazan", "holgazana", "holgazanes", "horto", "ignorante", "ignorantes", "inculta", "incultas", "inculto", 
  "incultos", "infiel", "infieles", "majadera", "majadero", "majaderos", "mameluca", "mameluco", "mamelucos", 
  "mangurrian", "mangurrianes", "mariquita", "mariquitas", "mastuerzo", "mastuerzos", "meapilas", "mediocre", 
  "mediocres", "memo", "memos", "mendrugo", "mendrugos", "miserable", "miserables", "mojigata", "mojigato", 
  "morronga", "morrongo", "morrongos", "mugrienta", "mugrientas", "mugriento", "mugrientos", "ordinaria", 
  "ordinario", "paganini", "paganinis", "palurda", "palurdo", "palurdos", "pantan", "panta", "parasita", 
  "parasitas", "parasito", "parasitos", "pasma", "pasmados", "patan", "patanes", "patan", "patana", "pellejo", 
  "pellejos", "periquera", "periqueras", "periquero", "periqueros", "pesima", "pesimo", "piltrafa", "piltrafas", 
  "piojosa", "piojosas", "piojoso", "piojosos", "poca", "pocas", "poco", "policia", "policias", "potorro", 
  "potorros", "prepotente", "prepotentes", "pringada", "pringado", "pringados", "puerca", "puercas", "puercos", 
  "rameras", "roja", "rojo", "rojos", "roñosa", "roñoso", "ruin", "ruines", "santurrona", "santurronas", 
  "santurrón", "santurrones", "sap", "sapo", "sapos", "sinverguenza", "sinverguenzas", "sobornada", "sobornado", 
  "soplagaitas", "soplona", "soplonas", "soplones", "sucia", "sucias", "sucio", "sucios", "tacaña", "tacañas", 
  "tacaño", "tacaños", "tarada", "taradas", "tarado", "tarados", "tosca", "tosco", "toscas", "traidora", 
  "traidoras", "traidor", "traidores", "trolaza", "trolazas", "usurera", "usureras", "usurero", "usureros", 
  "vaga", "vagas", "vago", "vagos", "vendida", "vendidas", "vendido", "vendidos", "zafia", "zafio", "zafios", 
  "zoquete", "zoquetes"
];


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
