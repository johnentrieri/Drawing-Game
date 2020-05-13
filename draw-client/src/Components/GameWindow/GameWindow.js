import React from 'react';

import TeamGameArea from './TeamGameArea/TeamGameArea';
import FailAlert from '../FailAlert/FailAlert';
import ExitButton from '../ExitButton/ExitButton';
import PauseButton from '../PauseButton/PauseButton';
import DrawingCanvas from './DrawingCanvas/DrawingCanvas';

const gameWindow = (props) => {
  
    let canvas = null;
    let prevWordLabel = null;

    if (props.game.teams) {

        const teamList = Object.keys(props.game.teams);
        for (let i=0;i<teamList.length;i++) {
            if (props.game.teams[teamList[i]].players[props.game.teams[teamList[i]].drawIndex] === props.user) {
                if (props.game.teams[teamList[i]].isActive && props.game.state === 'active') {
                    canvas = <DrawingCanvas team={teamList[i]} game={props.game} clearClicked={props.clearClicked} draw={props.draw} />
                }
            }
        }
        
        if (props.game.state === "buffer" && props.game.prevWord !== "") {
            prevWordLabel = <h3 className="text-center">Last Round: {props.game.prevWord}</h3>;
        } else {
            prevWordLabel = null;
        }
    }

    return (
        <div className="container my-5 p-5 bg-light rounded border border-secondary shadow">
            <h3>Game Window</h3>
            <FailAlert status={props.status} message={props.message} />
            <div className="row mt-5 mx-auto">
                <div className="col-sm-4"></div>
                <div className="col-sm-4">
                    {canvas}
                </div>
                <div className="col-sm-4"></div>
            </div>            
            <div className="row mt-5">
                <PauseButton 
                    game={props.game}
                    pauseClicked={props.pauseClicked}
                    resumeClicked={props.resumeClicked}
                />
            </div>
            <div className="row mt-5 container ">
                <div className="col-sm-4"></div>
                <div className="col-sm-4">
                    {prevWordLabel}
                </div>
                <div className="col-sm-4"></div>                
            </div>
            <div className="row mt-5">
                <div className="col-sm-1"></div>
                <div className="col-sm-4">
                    <TeamGameArea team="team1" user={props.user} game={props.game} guessClicked={props.guessClicked} clearClicked={props.clearClicked} draw={props.draw} />
                </div>
                <div className="col-sm-2"></div>
                <div className="col-sm-4">
                    <TeamGameArea team="team2" user={props.user} game={props.game} guessClicked={props.guessClicked} clearClicked={props.clearClicked} draw={props.draw} />
                </div>
                <div className="col-sm-1"></div>
            </div>
            <div className="row mt-5">
                <div className="col-sm-1"></div>
                <div className="col-sm-4">
                    <TeamGameArea team="team3" user={props.user} game={props.game} guessClicked={props.guessClicked} clearClicked={props.clearClicked} draw={props.draw} />
                </div>
                <div className="col-sm-2"></div>
                <div className="col-sm-4">
                    <TeamGameArea team="team4" user={props.user} game={props.game} guessClicked={props.guessClicked} clearClicked={props.clearClicked} draw={props.draw} />
                </div>
                <div className="col-sm-1"></div>
            </div>
            <div className="row mt-5 m-auto">
                <ExitButton 
                    user={props.user}
                    game={props.game}
                    disbandClicked={props.disbandClicked}
                    leaveClicked={props.leaveClicked}
                />
            </div>
        </div>
    );
};

export default gameWindow;
