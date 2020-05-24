const Game = require('../db/models/gameSchema');

hostGame = (request,response) => {   
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
        
        //Check if Room Name Already Exists
        if (doc) {
            return response.status(200).json({
                status: 'FAIL',
                message: 'Room Already Exists'
            })
        } else {

            //Create new 'Game'
            const tempGame = new Game({ name: body.room, host: body.user })

            //Set Password, if requested
            if (body.code) { tempGame.code = body.code; }

            //Add Host to Team 1
            tempGame.teams.team1.players.push(body.user);

            //Save 'Game' Document to Database
            tempGame.save( (err) => {
                if (err) {
                    return response.status(200).json({
                        status: 'FAIL',
                        message: err.message
                    })
                } else {
                    return response.status(200).json({
                        status: 'SUCCESS',
                        message: 'New Game Created',
                        user: body.user,
                        room: body.room
                    })
                }
            })
        }
    });
};

module.exports = hostGame;