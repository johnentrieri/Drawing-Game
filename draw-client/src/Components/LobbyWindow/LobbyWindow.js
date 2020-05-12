import React from 'react';

import TeamDisplay from './TeamDisplay/TeamDisplay';
import FailAlert from '../FailAlert/FailAlert';
import ExitButton from '../ExitButton/ExitButton';

const lobbyWindow = (props) => {
    return (
        <div className="container my-5 p-5 bg-light rounded border border-secondary shadow">
            <h3>Lobby Window</h3>
            <FailAlert status={props.status} message={props.message} />
            <div className="row mt-5">
                <div className="col-sm-3 w-100">
                    <TeamDisplay team='team1' game={props.game} joinClicked={props.joinClicked} />
                </div>
                <div className="col-sm-3 w-100">
                    <TeamDisplay team='team2' game={props.game} joinClicked={props.joinClicked} />
                </div>
                <div className="col-sm-3 w-100">
                    <TeamDisplay team='team3' game={props.game} joinClicked={props.joinClicked} />
                </div>
                <div className="col-sm-3 w-100">
                    <TeamDisplay team='team4' game={props.game} joinClicked={props.joinClicked} />
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-sm-3"></div>
                <div className="col-sm-6">
                    <button
                        type="button"
                        className="btn btn-success mx-1"
                        onClick = { () => {
                            return(props.startClicked())
                            }}
                        > 
                        Start Game
                    </button>
                    <ExitButton 
                        user={props.user}
                        game={props.game}
                        disbandClicked={props.disbandClicked}
                        leaveClicked={props.leaveClicked}
                    />
                </div>
                <div className="col-sm-3"></div>
            </div>
        </div>
    );
};

export default lobbyWindow;
