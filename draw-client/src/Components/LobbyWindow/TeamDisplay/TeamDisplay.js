import React from 'react';

const teamDisplay = (props) => {
    let teamData = null;
    if (props.game.teams) {
        teamData = props.game.teams[props.team].players.map( (player) => { return( <p>{player}</p> ) });
    }

    return (
        <div>
            <div className="bg-white rounded border border-secondary py-1">
                {teamData}
            </div>
            <div>
                <button
                    type="button"
                    className="w-100 btn btn-primary my-1"
                    onClick = { () => {
                        const t = props.team;
                        return(props.joinClicked(t))
                        }}
                    > 
                    Join
                </button>
            </div>
        </div>    
    );
};

export default teamDisplay;
