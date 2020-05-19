const Game = require('../db/models/gameSchema');

pauseGame = (request,response) => {   
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

            //Check if Game is already paused
            if (doc.state === 'paused') {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Game already paused',
                })
            } 

            else {

                //Set Previous State to Current State
                doc.prevState = doc.state;
                
                //Set State to Paused
                doc.state = 'paused';

                //Start Idle Timer
                doc.time.idle = Date.now();

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
                            message: 'Paused Game',
                            user: body.user,
                            room: doc.name
                        })
                    }
                }) 
            }
        }
    });
};

module.exports = pauseGame;