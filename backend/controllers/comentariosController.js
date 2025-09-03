const Comentario = require('../models/Comentario');

// Palabras prohibidas normalizadas (sin tildes, sin espacios especiales)
const palabrasProhibidas = [
  "mk","marica","estupido","idiota","imbecil","tonto","maldito","hdp",
  "puto","gonorrea","mierda","pendejo","cabron","culero","verga",
  "chinga","chingar","joder","jodido","hijodeputa","pinche","pinga",
  "coño","carajo","zorra","puta","maricon","pato","panocha","culia",
  "culiado","conchadetumadre","mecagoentumadre","mecagoendios",
  "mecagoentodo","chupapijas","chupapollas","pajero","pajilla",
  "vergas","chingada","chingadas","chingado","chingados",
  "malparido","malparidos","malditos","malditas","triplehijueputa",
  "triplehijueputas","hijueputa","hijueputas","hijueputo","hijueputos",
  "hijaputa","hijaputas","hijoputa","hijoputas","putas",
  "putos","pendejos","pendejas","pendeja","gilipollas","gilipollas",
  "gilipolla","gilipollo","concha","conchas","conchita","conchito",
  "cabrones","cabronas","cabrona","cabron","culeros","culeras",
"culera","culero","vergas","verga","vergon","vergones", "maricon","pene","penes","pane","panochas","panocha","polla","pollas","joder","jodidos",
  "jodida","jodidas","jodido","jodidos","coños","coño","carajos",
  "carajo","zorras","zorro","zorros","zorra","putas","puto","putos","perra","perras","perro","perros","maricones","maricas","marica","mariconas",
  "maricona","patas","pato","patos","patas","pata","culiá","culiás",
  "culiáo","culiáos","culiaos","culias","culia","culiado","culiados","nob","nob","nobs","nobs","nobes","nobe","troll","trolls","trol","troles",
  "trola","trolas","trolazo","trolazos","trolaza","trolazas","trolazo",
  "trolazos","mierda","mierdas","mierdero","mierderos","mierdera","verga","malo","peor","malos","peores","malas","peores","maldita","malditas","no sabe", "no saben","no sabias","no sabia","no supo","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","no supieron","hp","mal","pesimo","peor","horror","mediocre","morrongo","infiel","desleal","poca","bajo",
  "mal","pesimo","peor","horror","mediocre","morrongo","infiel","desleal","poca","bajo","cero","0","nulo","nula","nulos","nulas","basura","basuras","basurero","basureros","basurera","basureras",
  "lame","culo","lamer","lamida","lamidas","lamido","lamidos","lameculos",
  "lameculo","lameculos","lameculi","lameculis","lameculia","lameculias", "lameculiao","lameculiaos","lameculiados","lameculiadas",
  "lameculiado","lameculiada","lameculiados","lameculiadas","mamón",
  "mamona","mamonas","mamonazo","mamonazos","mamonazo","mamonazos",   "fracasado", "inutil", "retrasado", "lento", "bastardo", "grosero", "asqueroso", 
  "desgraciado", "malnacido", "cenutrio", "zoquete", "palurdo", "gañan", "patan", 
  "chupoptero", "mendrugo", "pagafantas", "carapapa", "caraculo", "carajote", "mequetrefe", 
  "piltrafa", "escoria", "chusma", "canalla", "sinverguenza", "granuja", "rufián", 
  "indeseable", "energumeno", "macarra", "golfa", "furcia", "fulana", "ramera", 
  "prostituta", "soplapollas", "mameluco", "majadero", "tarado", "morrobel", "garrulo", 
  "paleto", "cateto", "ignorante", "analfabeto", "inculto", "cateto", "prepotente", 
  "creido", "pagado", "chupamedias", "lameculos", "arrastrado", "vendido", "traga", 
  "soplagaitas", "mangurrian", "pellejo", "vejestorio", "mocoso", "chiquilicuatre", 
  "meapilas", " santurron", "mojigato", "hipocrita", "carrozas", "obsoleto", "pringao", 
  "gilipuertas", "mastuerzo", "zopenco", "abollao", "chupado", "esqueleto", "gorda", 
  "gordo", "feto", "enano", "enanito", "giganton", "memo", "bobalicon", "lelo", "pasma", 
  "chivato", "sapo", "soplon", "bufon", "payaso", "policia", "guardia", "facha", "rojo", 
  "fascista", "comunista", "capitalista", "esclavo", "señorito", "niñato", "niñata", 
  "mariquita", "flojo", "vago", "holgazan", "gandul", "parasito", "chupasangre", 
  "aprovechado", "usurero", "tacaño", "roñoso", "sucio", "cochino", "apestoso", "apestosa", 
  "apestados", "apestadas", "apestado", "apestada", "piojoso", "sarnoso", "grasiento", 
  "mugriento", "cerdo", "cerda", "marrano", "puerca", "bestia", "animal", "salvaje", 
  "bruto", "tosco", "patoso", "torpe", "zafio", "ordinario", "cutre","cacorro","cacorros","cacorra","cacorras","cagada","cagadas","cagado","cagados","cagarro","cagarros","cagarrro","cagarrros","cagarrro","cagarrros","cagarrada","cagarradas","cagarrado","cagarrados","cagarrada","cagarradas","cagaste","cagaron","cagamos","cagais","cagoen","cagoenla","cagoenlas","cagoenlo","cagoenlos","cagoenle","cagoenles","cagoentodo","cagoentoda","cagoentodas","cagoentodo","cagoentodos",
  "jodete","jodetela","jodetelas","jodetelo","jodetelos","jodetale","jodetales",
  "jodetoda","jodetodas","jodetodo","jodetodos",
  "hostia","hostias","hostion","hostiones",
  "ostia","ostias","ostion","ostiones","violador","violadores","violadora","violadoras",
  "asesino","asesinos","asesina","asesinas","ladrón","ladrones","ladrona","ladronas",
  "ratero","rateros","ratera","rateras","cabrón","cabrones","cabrona","cabronas", "mariunao","drogadicto","drogadictos","drogadicta","drogadictas","drogata","drogatas","drogon","drogones","drogona","drogonas",
  "borracho","borrachos","borracha","borrachas","alcoholico","alcoholicos","alcoholica",
  "alcoholicas","alcohólico","alcohólicos","alcohólica","alcohólicas","suicida","suicidas","soplon","soplones","soplona","soplonas","chivato","chivatos","chivata","chivatas",
  "cabrón","cabrones","cabrona","cabronas","malparido","malparidos","malparida","malparidas",
  "miserable","miserables","despreciable","despreciables","desgraciado","desgraciados","periquero","periqueros","periquera","periqueras","cagón","cagones","cagona","cagonas",
  "cagaste","cagaron","cagamos","cagais","cagoen","cagoenla","cagoenlas","cagoenlo","cagoenlos","cagoenle","cagoenles","cagoentodo","cagoentoda","cagoentodas","cagoentodo","cagoentodos",
  "pedorro","pedorros","pedorra","pedorras","marihuana","marihuanas","marihuanero","marihuaneros","marihuanera","marihuaneras",
  "coca","cocas","cocaina","cocainas","cocainomano","cocainomanos","cocainomana","cocainomanas",
  "heroina","heroinas","heroinomano","heroinomanos","heroinomana","heroinomanas", "puto","puta","putas","putos","pendejo","pendeja","pendejas","pendejos","gilipollas","gilipolla","gilipollo","gilipollos","gilipollas","gilipolla","gilipollo","gilipollos",
  "concha","conchas","conchita","conchito","conchitas","conchitos","conchudo","conchudos","conchuda","conchudas",
  "cabronazo","cabronazos","cabronaza","cabronazas","culerazo","culerazos","culeraza","culerazas",
  "vergonazo","vergonazos","vergonaza","vergonazas","zoplon","soplador","sopladora","sopladores","sopladoras","coca","homosexual","homosexualidad","lesbiana","lesbiano","lesbianas","gay","chupador","chupamelas","chupamela","chupamelas","chupamelo","chupamelos","chupamele","chupameles","chupamela","chupamelas","chupamelo","chupamelos","chupamele","chupameles","bolas","mariuanero","mariuanera","mariuaneros","mariuaneras","marihuana","marihuanas","mariguana","mariguanas","mariguano","mariguanos","mariconazo","mariconazos","mariconaza","mariconazas", "chiquito","chiquita","chiquitos","chiquitas","enano","enana","enanos","enanas","enanito","enanita","enanitos","enanitas",
  "imbecil","imbeciles","imbecila","imbecilas","idiota","idiotas","idiota","idiotas",
  "estupido","estupidos","estupida","estupidas","tonto","tontos","tonta","tontas","cagado"
];

// Normaliza: minúsculas, sin acentos, sin símbolos
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9áéíóúüñ]/g, "");
}

// Detecta si contiene ofensas
function contieneOfensas(texto) {
  const limpio = normalizarTexto(texto);
  return palabrasProhibidas.some(p => limpio.includes(normalizarTexto(p)));
}

// Sanitizar básico para evitar XSS
function contieneXSS(texto) {
  const xssRegex = /<script|<\/script|onerror=|onload=|javascript:/i;
  return xssRegex.test(texto);
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

    // Bloquear si contiene malas palabras
    if (contieneOfensas(contenido)) {
      return res.status(400).json({
        error: "🚫 Tu comentario contiene lenguaje inapropiado y no será publicado."
      });
    }

    // Bloquear si contiene XSS
    if (contieneXSS(contenido)) {
      return res.status(400).json({
        error: "🚫 Tu comentario contiene código no permitido."
      });
    }

    const nuevoComentario = new Comentario({
      usuario: {
        id: req.user.id,
        nombre: req.user.nombre,
        correo: req.user.correo,
        avatar: req.user.avatar
      },
      contenido,
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
