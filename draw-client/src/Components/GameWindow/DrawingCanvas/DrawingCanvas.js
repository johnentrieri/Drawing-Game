import React from 'react';

const drawingCanvas = (props) => {

    // Get a regular interval for drawing to the screen
    let requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame || 
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimaitonFrame ||
                    function (callback) {
                        window.setTimeout(callback, 1000/60);
                    };
    })();
    
    let wordLabel = null;
    if (props.game.teams) {   
        if (props.game.state === 'active') {
            wordLabel = <h3>Draw: {props.game.word}</h3>;
        } else {
            wordLabel = null;
        }

        const canvas = document.querySelector('#drawing-canvas canvas');

        if (canvas) {
            const ctx = canvas.getContext('2d');

            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        
           var drawing = false;
           var mousePos = null;
           var lastPos = mousePos;
           
           canvas.addEventListener("mousedown", function (e) {
               drawing = true;
               lastPos = getMousePos(canvas, e);
           }, false);

           canvas.addEventListener("mouseup", function (e) {
               drawing = false;
           }, false);

           canvas.addEventListener("mousemove", function (e) {
               mousePos = getMousePos(canvas, e);
           }, false);

           // Set up touch events for mobile, etc
           canvas.addEventListener("touchstart", function (e) {
               mousePos = getTouchPos(canvas, e);
               var touch = e.touches[0];
               var mouseEvent = new MouseEvent("mousedown", {
                   clientX: touch.clientX,
                   clientY: touch.clientY
               });
               canvas.dispatchEvent(mouseEvent);
           }, false);

           canvas.addEventListener("touchend", function (e) {
               var mouseEvent = new MouseEvent("mouseup", {});
               canvas.dispatchEvent(mouseEvent);
           }, false);

           canvas.addEventListener("touchmove", function (e) {
               var touch = e.touches[0];
               var mouseEvent = new MouseEvent("mousemove", {
                   clientX: touch.clientX,
                   clientY: touch.clientY
               });
               canvas.dispatchEvent(mouseEvent);
           }, false);

           // Prevent scrolling when touching the canvas
           document.body.addEventListener("touchstart", function (e) {
               if (e.target == canvas) {
                   e.preventDefault();
               }
           }, {passive : false});

           document.body.addEventListener("touchend", function (e) {
               if (e.target == canvas) {
                   e.preventDefault();
               }
           }, {passive : false});

           document.body.addEventListener("touchmove", function (e) {
               if (e.target == canvas) {
                   e.preventDefault();
               }
           }, {passive : false});

           // Get the position of the mouse relative to the canvas
           function getMousePos(canvasDom, mouseEvent) {
               var rect = canvasDom.getBoundingClientRect();
               return {
                   x: mouseEvent.clientX - rect.left,
                   y: mouseEvent.clientY - rect.top
               };
           }

           // Get the position of a touch relative to the canvas
           function getTouchPos(canvasDom, touchEvent) {
               var rect = canvasDom.getBoundingClientRect();
               return {
                   x: touchEvent.touches[0].clientX - rect.left,
                   y: touchEvent.touches[0].clientY - rect.top
               };
           }

           // Draw to the canvas
           function renderCanvas(initPos,finalPos) {
                if (drawing) {
                    if(initPos && finalPos) {
                        ctx.beginPath();
                        ctx.moveTo(initPos.x, initPos.y);
                        ctx.lineTo(finalPos.x, finalPos.y);
                        ctx.stroke();
                        props.draw(props.team,initPos,finalPos);
                    }
                }
           }

           // Allow for animation
           (function drawLoop () {
               requestAnimFrame(drawLoop);
               renderCanvas(lastPos,mousePos);
               lastPos = mousePos;
           })();

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
