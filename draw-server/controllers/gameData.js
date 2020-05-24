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

            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Game Found',
                data: doc
            })
        }
    });
};

module.exports = joinGame;