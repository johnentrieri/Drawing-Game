const Game = require('../db/models/gameSchema');
const processGameData = require('./processGameData');

guess = (request,response) => {   
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

    //Check for Empty Guess
    if (!body.word) {
        return response.status(200).json({
            status: 'FAIL',
            message: 'No Word Guessed'
        })
    }

    //Check for Empty Team Name
    if (!body.team) {
        return response.status(200).json({
            status: 'FAIL',
            message: 'No Team specified'
        })
    }

    //Search Database for Room
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

            //Check if User is on this Team
            const dIndex = doc.teams[body.team].drawIndex;
            if (!doc.teams[body.team].players.includes(body.user)) {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'User not on Team'
                })
            }   

            //Check if User is Drawer for Team
            else if (doc.teams[body.team].players[dIndex] == body.user) {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Drawer Cannot Guess'
                })
            }

            else {

                //Check if Guess is Incorrect
                processGameData(body.room,body.word,body.team);
                return response.status(200).json({
                    status: 'SUCCESS',
                    message: 'Guess Submitted'
                })
            }
        }
    });
};

module.exports = guess;