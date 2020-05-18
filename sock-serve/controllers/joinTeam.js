const Game = require('../db/models/gameSchema');

joinTeam = (request,response) => {   
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

    //Check for Empty Team Name
    if (!body.team) {
        return response.status(200).json({
            status: 'FAIL',
            message: 'No Team specified'
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

            //Check if User is in this Game
            let isUserFound = false;
            const teamList = Object.keys(doc.teams);
            for (let i=0;i<teamList.length;i++) {
                const playerList = doc.teams[teamList[i]].players;
                if (playerList && playerList.includes(body.user)) {
                    isUserFound = true;                                        
                    doc.teams[teamList[i]].players.splice(playerList.indexOf(body.user),1);
                    doc.teams[body.team].players.push(body.user);
                    doc.save( (err) => {
                        if (err) {
                            return response.status(200).json({
                                status: 'FAIL',
                                message: err.message
                            })
                        } else {
                            return response.status(200).json({
                                status: 'SUCCESS',
                                message: 'Joined Team'
                            })
                        }
                    })
                    break;
                }
            }
            if (!isUserFound) {
                return response.status(200).json({
                    status: 'FAIL',
                    message: 'Player not in Game'
                })
            }
        }
    });
};

module.exports = joinTeam;