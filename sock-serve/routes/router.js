//Dependencies
const express = require('express');

//Controllers
const gameData = require('../controllers/gameData');
const hostGame = require('../controllers/hostGame');
const joinGame = require('../controllers/joinGame');
const joinTeam = require('../controllers/joinTeam');
const startGame = require('../controllers/startGame');


//Router
const router = express.Router()

//API Routes
router.post('/hostgame/', hostGame);
router.post('/joingame/', joinGame);
router.post('/gamedata/', gameData);
router.post('/jointeam/', joinTeam);
router.post('/startGame/', startGame);

module.exports = router