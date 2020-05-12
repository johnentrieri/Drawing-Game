import React from 'react';

const viewingCanvas = (props) => {

    let guessForm = null; 
    let prevWordLabel = null;
    if (props.game.teams) {

        const canvas = document.getElementById(props.id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (!props.game.teams[props.id].isActive) {
                ctx.fillStyle = "gray";
                ctx.fillRect(0,0,canvas.width,canvas.height);
            }
        }
        
        let userOnTeam = false;
        for(let i=0;i<props.game.teams[props.id].players.length;i++) {
            if (props.game.teams[props.id].players[i] === props.user) {
                userOnTeam = true;
            }
        }
                   
        if (userOnTeam) {
            if (props.game.state === "buffer" && props.game.prevWord !== "") {
                prevWordLabel = <h3>Last Round: {props.game.prevWord}</h3>;
            } else {
                prevWordLabel = <h3>You are a Guesser!</h3>;
            }
            if (props.game.teams[props.id].isActive) {
                guessForm = <div>
                    <input id={"guess_"+props.id} placeholder="Guess" className="m-auto form-control" />
                    <button 
                            type="button"
                            className="btn btn-primary m-1"
                            onClick={ () => {
                                const t = props.id;
                                const g = document.querySelector('#guess_'+props.id).value;
                                return (props.guessClicked(t,g)); 
                            }}
                        >
                        Guess
                    </button>
                </div>
            }
        }
    }

    return (
        <div>
            {prevWordLabel}
            <canvas width="300" height="300" id={props.id} className="bg-white rounded border border-secondary shadow"></canvas>
            {guessForm}
        </div>
    );
};

export default viewingCanvas;
