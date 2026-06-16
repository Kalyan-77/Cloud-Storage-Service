const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../Models/Users");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,

      passReqToCallback: true
    },

    async (req, accessToken, refreshToken, profile, done) => {
      try {

        const action = req.session.oauthAction;

        const email = profile.emails?.[0]?.value;

        let user = await Users.findOne({ email });

        if (action === "login") {
          if (!user) {
            return done(
              null,
              false,
              {
                message: "ACCOUNT_NOT_FOUND"
              }
            );
          }
          user.googleAccessToken = accessToken;
          if (refreshToken) {
            user.googleRefreshToken = refreshToken;
          }
          await user.save();
          return done(null, user);
        }

        if (action === "register") {
          if (user) {
            return done(
              null,
              false,
              {
                message: "ACCOUNT_ALREADY_EXISTS"
              }
            );
          }

          user = await Users.create({
            name: profile.displayName,
            email: email,

            password: "GOOGLE_LOGIN",

            googleId: profile.id,

            googleAccessToken: accessToken,

            googleRefreshToken: refreshToken,

            authProvider: "google",

            avatar: profile.photos?.[0]?.value || ""
          });

          return done(null, user);
        }

        if (action === "connect") {

          if (!req.session.userId) {
            return done(
              null,
              false,
              {
                message: "LOGIN_REQUIRED"
              }
            );
          }

          const currentUser =
            await Users.findById(
              req.session.userId
            );

          if (!currentUser) {
            return done(
              null,
              false,
              {
                message: "USER_NOT_FOUND"
              }
            );
          }

          currentUser.googleId = profile.id;

          currentUser.googleAccessToken =
            accessToken;

          if (refreshToken) {
            currentUser.googleRefreshToken =
              refreshToken;
          }

          await currentUser.save();

          return done(
            null,
            currentUser
          );
        }


        return done(
          null,
          false,
          {
            message: "INVALID_OAUTH_ACTION"
          }
        );
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }

});

module.exports = passport;