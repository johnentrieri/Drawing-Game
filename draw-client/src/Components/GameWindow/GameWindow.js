import React from 'react';

import TeamGameArea from './TeamGameArea/TeamGameArea';
import FailAlert from '../FailAlert/FailAlert';
import ExitButton from '../ExitButton/ExitButton';
import PauseButton from '../PauseButton/PauseButton';

const gameWindow = (props) => {
  
    let timer = null;
    if (props.game.time) {
        timer = Math.round(parseInt(props.game.time.timeRemain));;
    }

    return (
        <div className="container my-5 p-5 bg-light rounded border border-secondary shadow">
            <h3>Game Window</h3>
            <FailAlert status={props.status} message={props.message} />
            <div className="row mt-5 text-center">
                <ul className="text-center list-unstyled">
                    <li>Timer: {timer}</li>
                </ul>
            </div>
            <div className="row mt-5">
                <PauseButton 
                    game={props.game}
                    pauseClicked={props.pauseClicked}
                    resumeClicked={props.resumeClicked}
                />
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
