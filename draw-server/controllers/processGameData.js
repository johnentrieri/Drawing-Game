
const Game = require('../db/models/gameSchema');
const fs = require('fs');

const wordFile = ".\\util\\nounlist.txt";

const processGameData = (roomName,guess,guessingTeam) => {

    Game.findOne( {name: roomName}, (err, doc) => {

        //DEBUG
        if (err) { console.log("[worker.js] Couldn't find room"); } 
        
        //Check if Room Exists
        if (doc) {

            //Get List of Teams
            const teamList = Object.keys(doc.teams);
            teamList.splice(0,1);

            //If a Correct Guess was submitted
            if(guess && guessingTeam && guess.toLowerCase() === doc.word.toLowerCase()) {

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

                //Turn Processing
                for(let i = 0;i<teamList.length;i++) {
                            
                    //If team just drew, designate new drawer
                    if (doc.teams[teamList[i]].isActive) {
                        doc.teams[teamList[i]].drawIndex = (doc.teams[teamList[i]].drawIndex + 1) % doc.teams[teamList[i]].players.length
                    }

                    //Team no longer draws
                    doc.teams[teamList[i]].isActive = false;
                }

                //Give a point to the team that guessed correctly
                doc.teams[guessingTeam].points += 1;

                //Guessing team goes again
                doc.teams[guessingTeam].isActive = true;

                //Get New Word
                fs.readFile(wordFile, "utf8", (err,data) => {
                    if (err) { console.log("[worker.js] Error Reading Word List"); }
                    else {
                        const words = data.split('\n');
                        const index = Math.floor(Math.random() * Math.floor(words.length))
                        doc.prevWord = doc.word;
                        doc.word = words[index].replace("\r","");

                        //Save Document to Database
                        doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
                    }
                })
            }

            //No Correct Guess Given
            else {

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

                        //Save Document to Database
                        doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
                    } else {
                        //Save Document to Database
                        doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
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

                        //Turn Processing
                        for(let i = 0;i<teamList.length;i++) {
                            
                            //If team just drew, designate new drawer
                            if (doc.teams[teamList[i]].isActive) {
                                doc.teams[teamList[i]].drawIndex = (doc.teams[teamList[i]].drawIndex + 1) % doc.teams[teamList[i]].players.length
                            }

                            //Team no longer draws
                            doc.teams[teamList[i]].isActive = false;
                        }

                        //Decide which team goes next
                        let isNextTeamSelected = false;
                        while (!isNextTeamSelected) {
                            doc.turn = (doc.turn + 1) % teamList.length 
                            if (doc.teams[teamList[doc.turn]].players.length > 0) {
                                doc.teams[teamList[doc.turn]].isActive = true;
                                isNextTeamSelected = true;
                            }
                        }

                        //Get New Word
                        fs.readFile(wordFile, "utf8", (err,data) => {
                            if (err) { console.log("[worker.js] Error Reading Word List"); }
                            else {
                                const words = data.split('\n');
                                const index = Math.floor(Math.random() * Math.floor(words.length))
                                doc.prevWord = doc.word;
                                doc.word = words[index]

                                //Save Document to Database
                                doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
                            }
                        })
                    } else {
                        //Save Document to Database
                        doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
                    }
                } 
                
                //Paused while Active - Time Processing
                else if(doc.state === 'pause' && doc.prevState === 'active') {
                    let currTime = Date.now();
                    doc.time.timeRemain = ((doc.time.drawLimit + doc.time.idleSum + (currTime - doc.time.idle)) - (currTime - doc.time.active)) / 1000

                    //Save Document to Database
                    doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
                } 
                
                //Paused while Buffering - Time Processing
                else if(doc.state === 'pause' && doc.prevState === 'buffer') {
                    let currTime = Date.now();
                    doc.time.timeRemain = ((doc.time.bufferLimit + doc.time.idleSum + (currTime - doc.time.idle)) - (currTime - doc.time.buffer)) / 1000

                    //Save Document to Database
                    doc.save( (err) => { if (err) { console.log("[worker.js] could not upload document to database"); } })
                }
            }
        }
    });    
}

module.exports = processGameData;