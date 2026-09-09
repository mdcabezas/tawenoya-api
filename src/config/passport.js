const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const db = require('./database');

function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await db('users').where({ google_id: profile.id }).first();

          if (!user) {
            [user] = await db('users')
              .insert({
                google_id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar_url: profile.photos[0]?.value,
                role: 'user',
              })
              .returning('*');
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db('users').where({ id }).first();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

module.exports = { configurePassport };
