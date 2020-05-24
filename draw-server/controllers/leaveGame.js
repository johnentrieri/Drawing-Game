const Game = require('../db/models/gameSchema');

leaveGame = (request,response) => {   
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

            //Check if User is already in this Game
            let isUserFound = false;
            const teamList = Object.keys(doc.teams);
            for (let i=0;i<teamList.length;i++) {
                const playerList = doc.teams[teamList[i]].players;
                if (playerList && playerList.includes(body.user)) {
                    isUserFound = true;
                    doc.teams[teamList[i]].players.splice(playerList.indexOf(body.user),1);
                }
            }

            if (!isUserFound) {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'User not found'
                })
            } else {
                
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
                            message: 'Left Game'
                        })
                    }
                }) 
            }
        }
    });
};

module.exports = leaveGame;