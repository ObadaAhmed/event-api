const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userController')
/* GET users listing. */
router.post('/register' , Controller.register )
router.post('/auth' , Controller.signIn )

module.exports = router;
