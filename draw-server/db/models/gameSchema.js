const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    name:  {type: String, required: true}, //Room Name
    host: {type: String, required: true}, //Host Name
    code: {type: String, default: ''}, //Code to Enter Room
    state: {type: String, default: 'lobby'}, //Current Game State
    prevState: {type: String, default: ''}, //Previous Game State  
    word: {type: String, default: ''}, //Current Word to be guessed
    prevWord: {type: String, default: ''}, //Previous Word to be guessed  
    turn: {type: Number, default: -1}, //Current Round
    time: {
        drawLimit: {type: Number, default: 10000}, //Drawing Time Limit 
        bufferLimit: {type: Number, default: 5000}, //Buffer Period Wait Time
        timeRemain: {type: Number, default: 0}, //Time Remaining
        active: {type: Number, default: 0}, //Active Timer (Start)
        buffer: {type: Number, default: 0}, //Buffer Timer (Start)
        idle: {type: Number, default: 0}, //Idle Timer (Start)
        idleSum: {type: Number, default: 0} //Sum of Idle Time
    },
    teams: {
        team1: {
            players: [String], // Array of Players on Team
            drawIndex: {type: Number, default: 0}, //Index of Drawer in Player Array
            points: {type: Number, default: 0}, //Total Points 
            isActive: {type: Boolean, default: false}, //Is Team Drawing
            isWinner: {type: Boolean, default: false}, //Did Team WIn
        },
        team2: {
            players: [String], // Array of Players on Team
            drawIndex: {type: Number, default: 0}, //Index of Drawer in Player Array
            points: {type: Number, default: 0}, //Total Points 
            isActive: {type: Boolean, default: false}, //Is Team Drawing
            isWinner: {type: Boolean, default: false}, //Did Team WIn
        },
        team3: {
            players: [String], // Array of Players on Team
            drawIndex: {type: Number, default: 0}, //Index of Drawer in Player Array
            points: {type: Number, default: 0}, //Total Points 
            isActive: {type: Boolean, default: false}, //Is Team Drawing
            isWinner: {type: Boolean, default: false}, //Did Team WIn
        },
        team4: {
            players: [String], // Array of Players on Team
            drawIndex: {type: Number, default: 0}, //Index of Drawer in Player Array
            points: {type: Number, default: 0}, //Total Points 
            isActive: {type: Boolean, default: false}, //Is Team Drawing
            isWinner: {type: Boolean, default: false}, //Did Team WIn
        }
    }
});

module.exports = mongoose.model('game', GameSchema);