const Game = require('../db/models/gameSchema');

resumeGame = (request,response) => {   
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

            //Check if Game is paused
            if (doc.state !== 'paused') {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Game is not paused',
                })
            } 

            else {
                
                //Set State to Previous State
                doc.state = doc.prevState;
                doc.prevState = '';

                //Update Idle Timer
                doc.time.idleSum += (Date.now() - doc.time.idle);
                doc.time.idle = 0;

                //Upload Document to Database
                doc.save( (err) => {
                    if (err) {
                        return response.status(200).json({
                            status: 'FAIL',
                            message: err.message
                        })
                    } else {
                        return response.status(200).json({
                            status: 'SUCCESS',
                            message: 'Game Resumed',
                            user: body.user,
                            room: doc.name
                        })
                    }
                }) 
            }
        }
    });
};

module.exports = resumeGame;