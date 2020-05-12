import React from 'react';

import FailAlert from '../FailAlert/FailAlert';

const loginWindow = (props) => {

    return (
        <div className="container my-5 p-5 bg-light rounded border border-secondary shadow">
            <h3>Login Window</h3>
            <FailAlert status={props.status} message={props.message} />
            <div className="row mt-5">
                <div className="col-sm-3"></div>
                <div className="col-sm-3 text-center">
                    <p>User Name: </p>
                </div>
                <div className="col-sm-3">
                    <input id="input_username" className="m-auto form-control" />
                </div>              
                <div className="col-sm-3"></div>
            </div>
            <div className="row my-2">
                <div className="col-sm-3"></div>
                <div className="col-sm-3 text-center">
                    <p>Room Name: </p>
                </div>
                <div className="col-sm-3">
                    <input id="input_roomname" className="m-auto form-control" />
                </div>              
                <div className="col-sm-3"></div>
            </div>
            <div className="row my-2">
                <div className="col-sm-3"></div>
                <div className="col-sm-3 text-center">
                    <p>Room Code: </p>
                </div>
                <div className="col-sm-3">
                    <input id="input_roomcode" type="password" className="m-auto form-control" />
                </div>              
                <div className="col-sm-3"></div>
                
            </div>
            <div className="row mt-5">
                <div className="col-sm-12">
                    <button 
                        type="button"
                        className="btn btn-primary mx-2 my-1"
                        onClick = {() => {
                            const u = document.querySelector('#input_username').value;
                            const r = document.querySelector('#input_roomname').value;
                            const c = document.querySelector('#input_roomcode').value;

                            return ( props.hostClicked(u,r,c))
                        }}> 
                        Host Game 
                    </button>
                    <button 
                        type="button"
                        className="btn btn-primary m2-4 my-1"
                        onClick = {() => {
                            const u = document.querySelector('#input_username').value;
                            const r = document.querySelector('#input_roomname').value;
                            const c = document.querySelector('#input_roomcode').value;

                            return ( props.joinClicked(u,r,c))
                        }}> 
                        Join Game 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default loginWindow;
