const Usuario = require("../models/Usuario");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async ( profile, done) => {
      try {
        const usuarioExistente = await Usuario.findOne({ googleId: profile.id });
        if (usuarioExistente) return done(null, usuarioExistente);

        const nuevoUsuario = new Usuario({
          googleId: profile.id,
          nombre: profile.displayName,
          email: profile.emails?.[0]?.value || null,
          foto: profile.photos?.[0]?.value || null,
        });

        await nuevoUsuario.save();
        return done(null, nuevoUsuario);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (err) {
    done(err, null);
  }
});
