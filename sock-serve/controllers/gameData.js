const Game = require('../db/models/gameSchema');

joinGame = (request,response) => {   
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

            //TODO - Time Processing

            //Check if User is already in this Game
            let isUserFound = false;
            const teamList = Object.keys(doc.teams);
            for (let i=0;i<teamList.length;i++) {
                const playerList = doc.teams[teamList[i]].players;
                if (playerList && playerList.includes(body.user)) {
                    isUserFound = true;
                    break;
                }
            }

            if (isUserFound) {

                //Buffer Period Time Processing
                if(doc.state === 'buffer') {
                    let currTime = Date.now();
                    doc.time.timeRemain = ((doc.time.bufferLimit + doc.time.idleSum) - (currTime - doc.time.buffer)) / 1000
                    
                    //Buffer Period Expired
                    if (doc.time.timeRemain < 0) {

                        //Set State to Active
                        doc.state = 'active';

                        //Reset Idle Timer
                        doc.time.idleSum = 0;
                        doc.time.idle = 0;

                        //Reset Buffer Timer
                        doc.time.buffer = 0;

                        //Reset Active Timer
                        doc.time.active = Date.now();
                        doc.time.timeRemain = doc.time.drawLimit / 1000;

                    }
                } 

                //Active State Time Processing
                else if(doc.state === 'active') {
                    let currTime = Date.now();
                    doc.time.timeRemain = ((doc.time.drawLimit + doc.time.idleSum) - (currTime - doc.time.active)) / 1000
                    
                    //Round Timer Expired
                    if (doc.time.timeRemain < 0) {

                        //Set State to Buffer
                        doc.state = 'buffer';

                        //Reset Idle Timer
                        doc.time.idleSum = 0;
                        doc.time.idle = 0;

                        //Reset Active Timer
                        doc.time.active = 0;

                        //Reset Buffer Timer
                        doc.time.buffer = Date.now();
                        doc.time.timeRemain = doc.time.bufferLimit / 1000;

                        //TODO - Turn Processing

                        //TODO - Get New Word
                    }
                } 
                
                //Paused while Active - Time Processing
                else if(doc.state === 'pause' && doc.prevState === 'active') {
                    let currTime = Date.now();
                    doc.time.timeRemain = ((doc.time.drawLimit + doc.time.idleSum + (currTime - doc.time.idle)) - (currTime - doc.time.active)) / 1000
                } 
                
                //Paused while Buffering - Time Processing
                else if(doc.state === 'pause' && doc.prevState === 'buffer') {
                    let currTime = Date.now();
                    doc.time.timeRemain = ((doc.time.bufferLimit + doc.time.idleSum + (currTime - doc.time.idle)) - (currTime - doc.time.buffer)) / 1000
                }

                //Save Document to Database
                doc.save( (err) => {
                    if (err) {
                        return response.status(200).json({
                            status: 'FAIL',
                            message: err.message
                        })
                    } else {
                        return response.status(200).json({
                            status: 'SUCCESS',
                            message: 'Game Found',
                            data: doc
                        })
                    }
                })
            } else {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Player not in Game'
                })
            }
        }
    });
};

module.exports = joinGame;