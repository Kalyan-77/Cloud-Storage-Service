const express = require('express');
const router = express.Router();
const auth = require('../Controllers/authController');
const authMiddleWare = require('../Middlewares/authMiddleware')

router.post('/register',auth.register);
router.post('/login',auth.login);
router.post('/logout',auth.Logout);
router.get('/checkSession', auth.checkSession);
router.get('/all-users',auth.getBackendData);
// router.post('/:id',auth.getUserById);
// router.put('/update/:id',auth.UpdateUser);
// router.delete('/delete/:id',auth.Delete);

router.get('/:id', authMiddleWare, auth.getUserById);
router.put('/update/:id', authMiddleWare, auth.UpdateUser);
router.delete('/delete/:id', authMiddleWare, auth.Delete);
router.put('/change-password/:id', authMiddleWare, auth.changePassword);



module.exports = router;


