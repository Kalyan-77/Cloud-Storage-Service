const express = require('express');
const router = express.Router();
const auth = require('../Controllers/authController');
const authMiddleWare = require('../Middlewares/authMiddleware')
const passport = require("passport");

const FRONTEND_URL = process.env.FRONTEND_URL;

router.get("/google/register", (req, res, next) => {
  console.log("Google Register Hit................................");
  req.session.oauthAction = "register";

  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive" // use drive.file for mosre safty but will not get the old data, it will only display the new uploaded data
    ],
    accessType: "offline",
    prompt: "consent"
  })(req, res, next);
});


router.get("/google/login", (req, res, next) => {
console.log("Google Login Hit................................");

  req.session.oauthAction = "login";

  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive"
    ],
    accessType: "offline"
  })(req, res, next);

});

router.get("/google/connect", authMiddleWare, (req, res, next) => {

  req.session.oauthAction = "connect";

  passport.authenticate(
    "google",
    {
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive"
      ],
      accessType: "offline",
      prompt: "consent"
    }
  )(req, res, next);

}
);

router.get(
  "/google/callback",

  (req, res, next) => {

    passport.authenticate(
      "google",
      async (err, user, info) => {

        if (err) {
          console.error(err);

          return res.redirect(
            `${FRONTEND_URL}/login?error=oauth_error`
          );
        }

        // LOGIN PAGE -> ACCOUNT NOT FOUND
        if (
          !user &&
          info?.message === "ACCOUNT_NOT_FOUND"
        ) {
          return res.redirect(
            `${FRONTEND_URL}/register?error=account_not_found`
          );
        }

        // REGISTER PAGE -> ACCOUNT ALREADY EXISTS
        if (
          !user &&
          info?.message === "ACCOUNT_ALREADY_EXISTS"
        ) {
          return res.redirect(
            `${FRONTEND_URL}/login?error=account_exists`
          );
        }

        if (!user) {
          return res.redirect(
            `${FRONTEND_URL}/login`
          );
        }

        req.logIn(user, (err) => {

          if (err) {
            console.error(err);

            return res.redirect(
              `${FRONTEND_URL}/login`
            );
          }

          req.session.userId = user._id;

          req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
          };
          if (
            req.session.oauthAction === "connect"
          ) {
            delete req.session.oauthAction;

            return res.redirect(
              `${FRONTEND_URL}/dashboard/configuration?success=drive_connected`
            );
          }

          delete req.session.oauthAction;

          return res.redirect(
            FRONTEND_URL
          );
        });

      }
    )(req, res, next);
  }
);

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.Logout);
router.get('/checkSession', auth.checkSession);
router.get('/all-users', auth.getBackendData);
router.delete('/google/disconnect', authMiddleWare, auth.disconnectGoogleDrive);
// router.post('/:id',auth.getUserById);
// router.put('/update/:id',auth.UpdateUser);
// router.delete('/delete/:id',auth.Delete);

router.get('/:id', authMiddleWare, auth.getUserById);
router.put('/update/:id', authMiddleWare, auth.UpdateUser);
router.delete('/delete/:id', authMiddleWare, auth.Delete);
router.put('/change-password/:id', authMiddleWare, auth.changePassword);


module.exports = router;


