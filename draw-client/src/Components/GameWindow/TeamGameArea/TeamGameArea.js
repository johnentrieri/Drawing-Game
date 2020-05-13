import React from 'react';

import ViewingCanvas from './ViewingCanvas/ViewingCanvas';

const teamGameArea = (props) => {

    let drawer = null;
    let active = null;
    let canvas = null;
    let points = null;
    let timer = null;

    if (props.game.teams) {

        points = <p>Points: {props.game.teams[props.team].points}</p>

        if (props.game.state === 'active') {
            timer = <p>Timer: {Math.round(parseInt(props.game.time.timeRemain))}</p>
        }

        drawer = props.game.teams[props.team].players[props.game.teams[props.team].drawIndex];
        active = props.game.teams[props.team].isActive ? "Yes" : "No";

        canvas = <ViewingCanvas id={props.team} user={props.user} game={props.game} guessClicked={props.guessClicked} />
    }
    return (
        <div>
            <p>{props.team}</p>
            {points}
            {timer}
            {canvas}
        </div>
    );
};

export default teamGameArea;
