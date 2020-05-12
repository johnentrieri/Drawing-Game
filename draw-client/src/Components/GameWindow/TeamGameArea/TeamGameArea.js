import React from 'react';

import DrawingCanvas from './DrawingCanvas/DrawingCanvas';
import ViewingCanvas from './ViewingCanvas/ViewingCanvas';

const teamGameArea = (props) => {

    let drawer = null;
    let active = null;
    let canvas = null;
    let points = null

    if (props.game.teams) {
        drawer = props.game.teams[props.team].players[props.game.teams[props.team].drawIndex];
        active = props.game.teams[props.team].isActive ? "Yes" : "No";
        points = props.game.teams[props.team].points;

        if ((active === "Yes") && (drawer === props.user)) {
            canvas = <DrawingCanvas team={props.team} game={props.game} clearClicked={props.clearClicked} draw={props.draw} />
        } else {
            canvas = <ViewingCanvas id={props.team} user={props.user} game={props.game} guessClicked={props.guessClicked} />
        }
    }
    return (
        <div>
            <p>{props.team}</p>
            <p>Points: {points}</p>
            {canvas}
        </div>
    );
};

export default teamGameArea;
