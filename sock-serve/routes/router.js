//Dependencies
const express = require('express');

//Controllers
const hostGame = require('../controllers/hostGame');
const joinGame = require('../controllers/joinGame');

//Router
const router = express.Router()

//API Routes
router.post('/hostgame/', hostGame);
router.post('/joingame/', joinGame);


module.exports = router