const express = require('express');
const router = express.Router();
const auth = require('../Controllers/authController');
const authMiddleWare = require('../Middlewares/authMiddleware')
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google",{
      scope:[
          "profile",
          "email",
          "https://www.googleapis.com/auth/drive" // use drive.file for mosre safty but will not get the old data, it will only display the new uploaded data
      ],
      accessType:"offline",
      prompt:"consent"
  })
);

router.get(
  "/google/connect",
  passport.authenticate("google",{
      scope:[
          "profile",
          "email",
          "https://www.googleapis.com/auth/drive"
      ],
      accessType:"offline",
      prompt:"consent"
  })
);

router.get(
  "/google/callback",

  passport.authenticate("google",{
      // failureRedirect:"http://localhost:5173/login"
      failureRedirect:`${process.env.FRONTEND_URL}/login`
  }),

  (req,res)=>{

      req.session.user = {
        _id:req.user._id,
        name:req.user.name,
        email:req.user.email
      };

    console.log("GOOGLE USER:", req.user);
    console.log("SESSION USER:", req.session.user);

      res.redirect(
        // "http://localhost:5173"
        process.env.FRONTEND_URL
      );
  }
);

router.post('/register',auth.register);
router.post('/login',auth.login);
router.post('/logout',auth.Logout);
router.get('/checkSession', auth.checkSession);
router.get('/all-users',auth.getBackendData);
router.delete('/google/disconnect', authMiddleWare, auth.disconnectGoogleDrive);
// router.post('/:id',auth.getUserById);
// router.put('/update/:id',auth.UpdateUser);
// router.delete('/delete/:id',auth.Delete);

router.get('/:id', authMiddleWare, auth.getUserById);
router.put('/update/:id', authMiddleWare, auth.UpdateUser);
router.delete('/delete/:id', authMiddleWare, auth.Delete);
router.put('/change-password/:id', authMiddleWare, auth.changePassword);


module.exports = router;


