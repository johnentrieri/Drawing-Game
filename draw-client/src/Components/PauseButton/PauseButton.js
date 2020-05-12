import React from 'react';

const pauseButton = (props) => {
    let label = null;
    let action = null;
    if (props.game.state) {
        if (props.game.state==='paused') {
            label = 'Resume';
            action = props.resumeClicked;
        } else {
            label = 'Pause';
            action = props.pauseClicked;
        }
    }

    return (
        <div className="mx-auto my-2">
            <button type="button" className="btn btn-primary mx-1 my-2" onClick = {action}> {label} </button>        
        </div>
    );
};

export default pauseButton;