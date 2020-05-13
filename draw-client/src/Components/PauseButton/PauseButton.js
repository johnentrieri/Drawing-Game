import React from 'react';

const pauseButton = (props) => {
    let label = null;
    let action = null;
    let classes = null;
    if (props.game.state) {
        if (props.game.state==='paused') {
            label = 'Resume';
            action = props.resumeClicked;
            classes = "btn btn-primary mx-1 my-2";            
        } else {
            label = 'Pause';
            action = props.pauseClicked;
            classes = "btn btn-primary mx-1 my-2";
        }
    }

    return (
        <div className="mx-auto my-2">
            <button type="button" className={classes} onClick = {action}> {label} </button>        
        </div>
    );
};

export default pauseButton;