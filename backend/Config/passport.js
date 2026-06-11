const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../Models/Users");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
      try {

        let user = await Users.findOne({
          email: profile.emails[0].value
        });

        if (!user) {

          user = await Users.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "GOOGLE_LOGIN",
            googleId: profile.id,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            authProvider: "google",
            avatar: profile.photos?.[0]?.value || ""
          });

        } else {

          user.googleId = profile.id;
          user.googleAccessToken = accessToken;

          if(refreshToken){
            user.googleRefreshToken = refreshToken;
          }

          await user.save();
        }

        return done(null,user);

      } catch(err){
        done(err,null);
      }
    }
  )
);

passport.serializeUser((user,done)=>{
  done(null,user._id);
});

passport.deserializeUser(async(id,done)=>{
  const user = await Users.findById(id);
  done(null,user);
});

module.exports = passport;