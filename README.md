# Drawing-Game

This is a team-based, online drawing game where the objective is to gain points by correctly guessing what word your teammate is drawing. The designated _Drawer_ for each team is cycled every round, and the rest of the team plays the role of a _guesser_ for that round.

The first round, all teams race to guess the same word, but after that, one team takes their turn at a time. When a team successfully guesses their word, they get to play again, with a new _drawer_. If the correct word is not guessed before the timer expires, play continues to the next team.

## Architecture Overview

The game is broken up into three separate applications:
* __Draw-Client:__ Front-End GUI Application
* __Draw-Serve:__ Back-End REST API / Game Management Server
* __Sock-Serve:__ Back-End WebSocket Canvas Management Server 

### Draw-Client

This is a JavaScript [React](https://reactjs.org/) based front-end client application that the players interact with to play the game. There is a single stateful, container component (__GameManager__) that interacts with the two back-end applications.

A WebSocket is established between this application and _Sock-Serve_ for the purposes of real-time canvas sharing between all of the clients within a game. As of this writing, drawing onto the canvas and clearing of the canvas are the only events/commands handled by _Sock-Serve_. All other game-related requests from this application are handled by _Draw-Serve_.

Most requests to _Draw-Serve_ are asynchronous based on GUI interactions by the players, with the exception of one _getGameData_ request that the front-end client uses to poll the back-end for game state data once per second, for the duration of that game's existence in the database.

### Draw-Serve

This is a Python [Flask](https://palletsprojects.com/p/flask/) application that provides a REST API to the Front-End for accessing and modifying the contents of a locally-hosted MongoDB collection.

This appplication is also responsible for processing the game state, including:
* Managing the game timer through round transitions, pauses, resumes, etc.
* Determining guess correctness & tracking team points
* Determining the _drawer_ for each team, each round
* Determining round transitions and which team takes their turn next
* Determining the random word that must be guessed each round


### Sock-Serve

This is JavaScript Express based server application that uses [Socket.io](https://socket.io/) to establish a WebSocket connection with the front-end. This connection is solely for the purposes of real-time canvas sharing among players, as performing the equivalent using _Draw-Serve_ and continous polling proved to be inferior.

The same arguments passed to the local _draw_ and _clear_ functions on the front-end, are emitted through the WebSocket connections and passed back to the front-end for mimicking the drawing events on each _guesser's_ client.

## Installing and Running the Applications

Each application should be independently setup, installed, and run for the game to function properly

### Draw-Serve

A base installation of Python 3.7 using the [Anaconda Platform](https://www.anaconda.com/) has been the primary environment for development and execution of _Draw-Serve_, along with the following modules installed:
* [__Flask__](https://palletsprojects.com/p/flask/) : Lightweight framework for creating web applications
* [__PyMongo__](https://pymongo.readthedocs.io/en/stable/) : MongoDB driver for Python

Once all dependencies are installed, navigate to the _server_ directory and run the application from a command-line terminal:

```
cd drawing-game\server\
python draw-serve.py
```

### Sock-Serve

[Node.js](https://nodejs.org/en/) is required for installation of _Sock-Serve_. With Node.js installed, navigate to the _sock-serve_ directory and install the package dependencies:

```
cd drawing-game\sock-serve\
npm install
```

Once the installation of dependencies is complete, the application can be run from the _sock-serve_ directory:

```
node index.js
```

While developing, it is recommended to run using [nodemon](https://nodemon.io/):

```
nodemon index.js
```

### Draw-Client

[Node.js](https://nodejs.org/en/) is required for installation of _Draw-Client_. With Node.js installed, navigate to the _draw-client_ directory and install the package dependencies:

```
cd drawing-game\draw-client\
npm install
```

_Draw-Client_ was created using [create-react-app](https://github.com/facebook/create-react-app). Once the installation of dependencies is complete, the application can be run from the _draw-client_ directory:

```
npm start
```

### Troubleshooting

If all went successfully, there should be three command-line terminals in the background running the three applications described above. Upon running `npm start`, a web-browser should have launched with the login screen of the front-end application.

If any terminals indicate something went wrong, follow debugging steps within the terminal and cross-check the installation steps above to ensure the process was followed correctly.

### Playing with Friends

The applications are configured to run and communicate all within a single machine. To extend the game to be able to run on multiple machines within your local network, the front-end application must be modified to communicate with the machines hosting the back-end application as follows:

Identify the local IP address of the machine on the network that is running the two back-end applications (typically _192.168.X.X_)

Modify the below lines in _drawing-game\draw-client\src\containers\GameManager.js_...

```javascript
let socket = io.connect('http://localhost:4000');
const API_URL = "http://localhost:5000"
```

to...

```javascript
let socket = io.connect('http://192.168.X.X:4000');
const API_URL = "http://192.168.X.X:5000"
```
Upon saving, the front-end application should automatically refresh, incorporating the new changes.

To confirm the action was successful, a separate machine on the local network should be able to navigate to _http://192.168.X.X:3000_ and access the login page of the front-end application.

This same process (with some extra work) can be followed using your External IP address to extend the game to players outside of your local network. Aside from changing the IP Addresses in the front-end application, your network must be configured to forward incoming and outgoing traffic on external ports 3000 (front-end), 4000 (WebSocket Server), and 5000 (REST API) to the machine hosting the applications. Refer to your Router's Manual or Internet Service Provider (ISP) for guidance on how to forward ports.