import React, {Component} from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import LoginWindow from '../Components/LoginWindow/LoginWindow';
import LobbyWindow from '../Components/LobbyWindow/LobbyWindow';
import GameWindow from '../Components/GameWindow/GameWindow';

let socket = io.connect('http://localhost:4000');
const API_URL = "http://localhost:5000"

//Listen Drawing Event
socket.on('draw', (team,points) => {
    let canvas = document.getElementById(team);
    if(canvas && points.length > 0) {
        const ctx = canvas.getContext('2d');

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
});

//Listen Clear Event
socket.on('clear', (team) => {
    let canvas = document.getElementById(team);
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);      
    }
});

;

class GameManager extends Component {
    state = {
        username : "",
        room : "",
        responseStatus : "",
        responseMessage: "",
        gameData : {},
        prevTimeRemain : 0
    }

    componentDidMount() {
        this.timer = setInterval(() => this.getGameData(), 1000);
    }

    componentWillUnmount() {
        this.timer = null;
    }
    
    //componentDidUpdate(prevProps, prevState) {}

    getGameData = () => {
        if (this.state.room !== "") {
            
            let bodyFormData = new FormData();
            bodyFormData.set('user', this.state.username);
            bodyFormData.set('room', this.state.room);

            axios({
                method: 'post',
                url: API_URL + '/gamedata/',
                data: bodyFormData,
                headers: {'Content-Type': 'multipart/form-data' }
            })
            .then( (response) => {
                if (response.data.status === "SUCCESS") {
                    let gd = response.data.data;
                    this.setState({ gameData : gd });
                    if (gd['time']['timeRemain'] > this.state.prevTimeRemain && gd['state'] === 'active') {
                        this.clearViewingCanvas('team1');
                        this.clearViewingCanvas('team2');
                        this.clearViewingCanvas('team3');
                        this.clearViewingCanvas('team4');
                    }
                    this.setState({ prevTimeRemain : gd['time']['timeRemain']})
                }
                else {
                    this.setState({ username : "" });
                    this.setState({ room : "" });
                }
            })
        }
    }

    hostGameHandler = (user, room, code) => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', user);
        bodyFormData.set('room', room);
        bodyFormData.set('code', code);

        axios({
            method: 'post',
            url: API_URL + '/hostgame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
            if (response.data.status === "SUCCESS") {
                this.setState({ username : response.data.user });
                this.setState({ room : response.data.room });
                this.getGameData();
            }
        })
    }

    joinGameHandler = (user, room, code) => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', user);
        bodyFormData.set('room', room);
        bodyFormData.set('code', code);

        axios({
            method: 'post',
            url: API_URL + '/joingame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
            if (response.data.status === "SUCCESS") {
                this.setState({ username : response.data.user });
                this.setState({ room : response.data.room });
                this.getGameData();
            }
        })
    }

    joinTeamHandler = (team) => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);
        bodyFormData.set('team', team);

        axios({
            method: 'post',
            url: API_URL + '/jointeam/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
            if (response.data.status === "SUCCESS") {
                this.getGameData();
            }
        })
    }

    startGameHandler = () => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);

        axios({
            method: 'post',
            url: API_URL + '/startgame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
            if (response.data.status === "SUCCESS") {
                this.getGameData();
            }
        })
    }

    drawHandler = (team,points) => {
        socket.emit('draw',team,points);        
    }

    clearViewingCanvas = (team) => {
        socket.emit('clear',team);
    }

    clearCanvasHandler = (team) => {
        let canvas = document.querySelector('#drawing-canvas canvas');
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            socket.emit('clear',team);
        }
    }

    guessHandler = (team,guess) => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);
        bodyFormData.set('team', team);
        bodyFormData.set('guess', guess);

        axios({
            method: 'post',
            url: API_URL + '/guess/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
        })
    }

    disbandGameHandler = () => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);

        axios({
            method: 'post',
            url: API_URL + '/disbandgame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
            if (response.data.status === "SUCCESS") {
                this.setState({ username : "" });
                this.setState({ room : "" });
                this.getGameData();
            }
        })
    }

    pauseGameHandler = () => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);

        axios({
            method: 'post',
            url: API_URL + '/pausegame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
        })
    }

    resumeGameHandler = () => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);

        axios({
            method: 'post',
            url: API_URL + '/resumegame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
        })
    }

    leaveGameHandler = () => {
        let bodyFormData = new FormData();
        bodyFormData.set('user', this.state.username);
        bodyFormData.set('room', this.state.room);

        axios({
            method: 'post',
            url: API_URL + '/leavegame/',
            data: bodyFormData,
            headers: {'Content-Type': 'multipart/form-data' }
        })
        .then( (response) => {
            this.setState({ responseStatus : response.data.status });
            this.setState({ responseMessage : response.data.message });
            if (response.data.status === "SUCCESS") {
                this.setState({ username : "" });
                this.setState({ room : "" });
            }
        })
    }

    render() {
        let display=null;
        if (this.state.username==="" && this.state.room==="") {
            display = <div>
                <LoginWindow 
                    hostClicked={this.hostGameHandler}
                    joinClicked={this.joinGameHandler}
                    status={this.state.responseStatus}
                    message={this.state.responseMessage}                    
                />
            </div>;
        } else {
            if (this.state.gameData.state) {
                if (this.state.gameData.state === 'lobby') {
                    display = <div>
                        <LobbyWindow 
                            user={this.state.username}
                            game={this.state.gameData}
                            joinClicked={this.joinTeamHandler}
                            startClicked={this.startGameHandler}
                            disbandClicked={this.disbandGameHandler}
                            leaveClicked={this.leaveGameHandler}
                            status={this.state.responseStatus}
                            message={this.state.responseMessage}                
                        />
                    </div>;
                }
                else {
                    display = <div>
                        <GameWindow 
                            user={this.state.username}
                            game={this.state.gameData}
                            clearClicked={this.clearCanvasHandler}
                            draw={this.drawHandler}
                            guessClicked={this.guessHandler}
                            pauseClicked={this.pauseGameHandler}
                            resumeClicked={this.resumeGameHandler}
                            disbandClicked={this.disbandGameHandler}
                            leaveClicked={this.leaveGameHandler}
                            status={this.state.responseStatus}
                            message={this.state.responseMessage}
                        />
                    </div>;
                }
            }
        }

        return (
            <div>
                {display}
            </div>
        )
    }
};

export default GameManager;


