//Dependencies
const express = require('express');

//Controllers
const hostGame = require('../controllers/hostGame');

//Router
const router = express.Router()

//API Routes
router.post('/hostgame/', hostGame);


module.exports = router