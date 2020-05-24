# Drawing-Game

This is a team-based, online drawing game where the objective is to gain points by correctly guessing what word your teammate is drawing. The designated _Drawer_ for each team is cycled every round, and the rest of the team plays the role of a _guesser_ for that round.

The first round, all teams race to guess the same word, but after that, one team takes their turn at a time. When a team successfully guesses their word, they get to play again, with a new _drawer_. If the correct word is not guessed before the timer expires, play continues to the next team.

## Architecture Overview

The game is broken up into two separate applications:

* __Draw-Client:__ Front-End GUI Application
* __Draw-Server:__ Back-End REST API / WebSocket Game Management Server

### Draw-Client

This is a JavaScript [React](https://reactjs.org/) based front-end client application that the players interact with to play the game. There is a single stateful, container component (__GameManager__) that interacts with the back-end application.

A WebSocket is established between this application and _Draw-Server_ for the purposes of real-time canvas sharing between all of the clients within a game. All other game-related requests from this application are handled via the REST API provided by _Draw-Server_.

Most requests to _Draw-Server_ are asynchronous based on GUI interactions by the players, with the exception of one _getGameData_ request that the front-end client uses to poll the back-end for game state data once per second, for the duration of that game's existence in the database.

### Draw-Server

This is a JavaScript [Express](https://expressjs.com/) based back-end application that provides a REST API to the Front-End for accessing and modifying the contents of a locally-hosted MongoDB database via [Mongoose](https://mongoosejs.com/). The server also makes use of the [Agenda](https://github.com/agenda/agenda) library for asynchronous background processing.

This REST API is responsible for processing the game state, including:

* Managing the game timer through round transitions, pauses, resumes, etc.
* Determining guess correctness & tracking team points
* Determining the _drawer_ for each team, each round
* Determining round transitions and which team takes their turn next
* Determining the random word that must be guessed each round

This application also uses [Socket.io](https://socket.io/) to establish a WebSocket connection with the front-end. This connection is solely for the purposes of real-time canvas sharing among players, as handling this through continous polling (like the rest of game data) proved to be usuccessful.

The same arguments passed to the local _draw_ and _clear_ functions on the front-end, are emitted through the WebSocket connections and passed back to the front-end for mimicking the drawing events on each _guesser's_ client.

## Installing and Running the Applications

Each application should be independently setup, installed, and run for the game to function properly.

[Node.js](https://nodejs.org/en/) is required for installation of both applications.

### Draw-Server

With Node.js installed, navigate to the _draw-server_ directory and install the package dependencies:

```console
cd drawing-game\draw-server\
npm install
```

Once the installation of dependencies is complete, the application can be run from the _draw-server_ directory:

```console
node index.js
```

While developing, it is recommended to run using [nodemon](https://nodemon.io/):

```console
nodemon index.js
```

### Draw-Client

With Node.js installed, navigate to the _draw-client_ directory and install the package dependencies:

```console
cd drawing-game\draw-client\
npm install
```

_Draw-Client_ was created using [create-react-app](https://github.com/facebook/create-react-app). Once the installation of dependencies is complete, the application can be run from the _draw-client_ directory:

```console
npm start
```

### Troubleshooting

If all went successfully, there should be three command-line terminals in the background running the three applications described above. Upon running `npm start`, a web-browser should have launched with the login screen of the front-end application.

If any terminals indicate something went wrong, follow debugging steps within the terminal and cross-check the installation steps above to ensure the process was followed correctly.

### Playing with Friends

The applications are configured to run and communicate all within a single machine. To extend the game to be able to run on multiple machines within your local network, the front-end application must be modified to communicate with the machines hosting the back-end application as follows:

Identify the local IP address of the machine on the network that is running the back-end application (typically _192.168.X.X_)

Modify the below lines in _drawing-game\draw-client\src\containers\GameManager.js_...

```javascript
let socket = io.connect('http://localhost:4000');
const API_URL = "http://localhost:4000/api";
```

to...

```javascript
let socket = io.connect('http://192.168.X.X:4000');
const API_URL = "http://192.168.X.X:4000/api"
```

Upon saving, the front-end application should automatically refresh, incorporating the new changes.

To confirm the action was successful, a separate machine on the local network should be able to navigate to _http://192.168.X.X:3000_ and access the login page of the front-end application.

This same process (with some extra work) can be followed using your External IP address to extend the game to players outside of your local network. Aside from changing the IP Addresses in the front-end application, your network must be configured to forward incoming and outgoing traffic on external ports 3000 (Client) and 4000 (Server), and 5000 (REST API) to the machine hosting the applications. Refer to your Router's Manual or Internet Service Provider (ISP) for guidance on how to forward ports.
