import React from 'react';

const drawingCanvas = (props) => {

    let wordLabel = null;
    if (props.game.teams) {   
        if (props.game.state === 'active') {
            wordLabel = <h3>Draw: {props.game.word}</h3>;
        } else if (props.game.state === 'buffer' && props.game.prevWord !== "") {
            wordLabel = <h3>Last Round: {props.game.prevWord}</h3>;
        } else {
            wordLabel = <h3>You are the Drawer!</h3>;
        }

        const canvas = document.querySelector('#drawing-canvas canvas');

        if (canvas) {
            const ctx = canvas.getContext('2d');

            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            let started = false;
            let points = [];

            const mouseMove = (e) => { 
                if (started) {
                    var m = getMouse(e, canvas);
                    points.push({
                        x: m.x,
                        y: m.y
                    });
                    drawPoints(ctx, points);
                    props.draw(props.team,points);
                }
            };

            const mouseUp = (e) => { 
                if (started) {
                    started = false;
                    points = [];
                }
            };

            const mouseDown = (e) => {
                let m = getMouse(e, canvas);
                points.push({
                    x: m.x,
                    y: m.y
                });
                started = true;
            };

            const drawPoints = (ctx, points) => {
                if (props.game.state === 'active') {
                    // draw a basic circle instead
                    if (points.length < 6) {
                        let b = points[0];
                        ctx.beginPath();
                        ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
                        ctx.closePath();
                        ctx.fill();
                        return
                    }
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    // draw a bunch of quadratics, using the average of two points as the control point
                    let i = 1;
                    for (i = 1; i < points.length - 2; i++) {
                        let c = (points[i].x + points[i + 1].x) / 2,
                            d = (points[i].y + points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
                    }
                    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
                    ctx.stroke();
                }
            }

            const getMouse = (e, canvas) => {
                var element = canvas, offsetX = 0, offsetY = 0, mx, my;
            
                // Compute the total offset. It's possible to cache this if you want
                if (element.offsetParent !== undefined) {
                do {
                    offsetX += element.offsetLeft;
                    offsetY += element.offsetTop;
                } while ((element = element.offsetParent));
                }
            
                mx = e.pageX - offsetX;
                my = e.pageY - offsetY;
            
                // We return a simple javascript object with x and y defined
                return {x: mx, y: my};
            };

            canvas.addEventListener('mousedown', mouseDown, false );
            canvas.addEventListener('mousemove', mouseMove, false );
            canvas.addEventListener('mouseup', mouseUp, false );
        }        
    }

    return (
        <div id="drawing-canvas">
            {wordLabel}
            <canvas display="block" width="300" height="300" className="bg-white rounded border border-secondary shadow"></canvas>
            <div>
                <button 
                    type="button"
                    className="btn btn-danger m-1"
                    onClick={ () => {
                        const t = props.team;
                        return ( props.clearClicked(t)); 
                    }}
                >
                Clear
                </button>
            </div>
        </div>
    );
};

export default drawingCanvas;
