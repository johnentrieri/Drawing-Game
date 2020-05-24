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

            //Check if Password is Correct
            if (doc.code !== body.code) {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Room Code Incorrect'
                })
            } 

            //Check if User is already in this Game
            const teamList = Object.keys(doc.teams);
            for (let i=0;i<teamList.length;i++) {
                const playerList = doc.teams[teamList[i]].players;
                if (playerList && playerList.includes(body.user)) {
                    return response.status(200).json({
                        status: 'SUCCESS',
                        message: 'Rejoined Game',
                        user: body.user,
                        room: doc.name
                    })
                }
            }

            if (doc.state !== 'lobby') {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Game has already started',
                })
            } else {
                
                doc.teams.team1.players.push(body.user);
                doc.save( (err) => {
                    if (err) {
                        return response.status(200).json({
                            status: 'FAIL',
                            message: err.message
                        })
                    } else {
                        return response.status(200).json({
                            status: 'SUCCESS',
                            message: 'Joined Game',
                            user: body.user,
                            room: doc.name
                        })
                    }
                }) 
            }
        }
    });
};

module.exports = joinGame;