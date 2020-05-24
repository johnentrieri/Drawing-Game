const Game = require('../db/models/gameSchema');
const fs = require('fs');
const Agenda = require('Agenda');

const wordFile = ".\\util\\nounlist.txt";

const processGameData = require('./processGameData');

const mongoConnectionString = 'mongodb://127.0.0.1/agenda';
const agenda = new Agenda({db: {address: mongoConnectionString}});

agenda.define('process-game-data', async (job) => {
    processGameData(job.attrs.data.roomName);
});

startGame = (request,response) => {   
    const body = request.body;

    //Check for Empty Body
    if (!body) {
        return response.status(200).json({
            status: 'FAIL',
            message: 'Body Empty'
        })
    }

    //Check for Empty Room Name
    if (!body.room) {
        return response.status(200).json({
            status: 'FAIL',
            message: 'Room Name Empty'
        })
    }

    //Check for Empty User Name
    if (!body.user) {
        return response.status(200).json({
            status: 'FAIL',
            message: 'User Name Empty'
        })
    }

    Game.findOne( {name: body.room}, (err, doc) => {
        if (err) {
            return response.status(200).json({
                status: 'FAIL',
                message: err.message
            })
        } 
        
        //Check if Room Exists
        if (!doc) {
            return response.status(200).json({
                status: 'FAIL',
                message: 'Room Not Found'
            })
        } else {

            //Check if Game has already begun
            if (doc.state !== 'lobby') {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Game is in progress'
                })
            }

            //Check if User is Host
            if (body.user !== doc.host) {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Only Host Can Start Game'
                })
            }

            //Check if any teams have only 1 player
            const teamList = Object.keys(doc.teams);
            for (let i=1;i<teamList.length;i++) {
                if (doc.teams[teamList[i]].players.length === 1) {
                    return response.status(200).json({
                        status: 'FAIL',
                        message: 'Every Active Team must have 2+ Players'
                    })
                } 
                
                //Any teams with players becomes active
                if (doc.teams[teamList[i]].players.length > 0) {
                    doc.teams[teamList[i]].isActive = true;
                }
            }

            //Start Buffer Period
            doc.state = 'buffer';
            doc.time.timeRemain = doc.time.bufferLimit / 1000;
            doc.time.buffer = Date.now();

            //Get New Word
            fs.readFile(wordFile, "utf8", (err,data) => {
                if (err) {
                       return response.status(200).json({
                        status: 'FAIL',
                        message: "Error Reading Word List"
                    })
                } else {
                    const words = data.split('\n');
                    const index = Math.floor(Math.random() * Math.floor(words.length))
                    doc.word = words[index].replace("\r","");

                    //Save Document to Database
                    doc.save( (err) => {
                        if (err) {
                            return response.status(200).json({
                                status: 'FAIL',
                                message: err.message
                            })
                        } else {   
                            (async function() { // IIFE to give access to async/await
                                await agenda.processEvery('1 second');
                                await agenda.start();    
                                await agenda.every('1 seconds', 'process-game-data', {roomName : body.room});  
                            })();        
                            return response.status(200).json({
                                status: 'SUCCESS',
                                message: 'Started Game'
                            })                          
                        }
                    })
                }
            })                       
        }
    });
};

module.exports = startGame;