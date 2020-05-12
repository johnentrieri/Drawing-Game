import React from 'react';

const exitButton = (props) => {
    let exitButton = null;
    if (props.game.host) {
        if (props.user === props.game.host) {
            exitButton = 
                <button
                    type="button"
                    className="btn btn-danger mx-1"
                    onClick = { () => {
                        return(props.disbandClicked())
                        }}
                    > 
                    Disband Game
                </button>;
        } else {
            exitButton = 
            <button
                type="button"
                className="btn btn-danger mx-1 my-2"
                onClick = { () => {
                    return(props.leaveClicked())
                    }}
                > 
                Leave Game
            </button>

        }
    }

    return (
        <div className="mx-auto my-2">{exitButton}</div>
    );
};

export default exitButton;