import json
from bson import json_util
import flask
import os
from pymongo import MongoClient
import time
from random import randint

#Flask App Initialization
app = flask.Flask(__name__)

#MongoDB Connection
client = MongoClient("mongodb://127.0.0.1:27017")
db = client.drawgame
game_collection = db.game

def getWord():
    wordFile = open('nounlist.txt','r+')
    words = wordFile.read().split('\n')
    wordFile.close()

    r = randint(0,len(words))

    return words[r].capitalize()



def guessedCorrectly(room,guessingTeam):

    #Load game data
    gameData = game_collection.find_one({'name' : room})
    
    #Reset Idle Timer
    gameData['time']['idleSum'] = 0
    gameData['time']['idle'] = 0

    #Reset Active Timer
    gameData['time']['timeRemain'] = gameData['time']['drawLimit']
    gameData['time']['active'] = time.time()

    #Upload New Timers to Server
    game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

    #Team Updates
    for team in gameData['teams']:
        if (gameData['teams'][team]['isActive']):
            
            #Clear Canvas
            gameData['teams'][team]['canvas'] = []

            #Cycle to next Drawer
            numPlayers = len(gameData['teams'][team]['players'])
            gameData['teams'][team]['drawIndex'] = ((gameData['teams'][team]['drawIndex'] + 1) % numPlayers)

            #Deactivate Team
            gameData['teams'][team]['isActive'] = False
    
    #Add Point to Guessing Team
    gameData['teams'][guessingTeam]['points'] += 1

    #Guessing Team's Turn Again
    gameData['teams'][guessingTeam]['isActive'] = True

    game_collection.update_one({'name' : room}, {'$set' : {'teams' : gameData['teams']}})    

    #Get New Word
    prevWord = gameData['word']
    game_collection.update_one({'name' : room}, {'$set' : {'prevWord' : prevWord }})
    game_collection.update_one({'name' : room}, {'$set' : {'word' : getWord() }})

def roundExpired(room):

    #Load game data
    gameData = game_collection.find_one({'name' : room})

    #Set state to Buffer    
    game_collection.update_one({'name' : room}, {'$set' : {'state' : 'buffer'}})

    #Reset Idle Timer
    gameData['time']['idleSum'] = 0
    gameData['time']['idle'] = 0

    #Reset Buffer Timer
    gameData['time']['timeRemain'] = gameData['time']['bufferLimit']
    gameData['time']['buffer'] = time.time()

    #Upload New Timers to Server
    game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

   #Team Updates
    for team in gameData['teams']:
        if (gameData['teams'][team]['isActive']):
            
            #Clear Canvas
            gameData['teams'][team]['canvas'] = []

            #Cycle to next Drawer
            numPlayers = len(gameData['teams'][team]['players'])
            gameData['teams'][team]['drawIndex'] = ((gameData['teams'][team]['drawIndex'] + 1) % numPlayers)

            #Deactivate Team
            gameData['teams'][team]['isActive'] = False
    
    #Determine next Active Team
    teamList = []
    for team in gameData['teams'].keys():
        if (len(gameData['teams'][team]['players']) > 0):
            teamList.append(team)

    gameData['turn'] = (gameData['turn'] + 1) % len(teamList)
    gameData['teams'][teamList[gameData['turn']]]['isActive'] = True

    game_collection.update_one({'name' : room}, {'$set' : {'turn' : gameData['turn']}})
    game_collection.update_one({'name' : room}, {'$set' : {'teams' : gameData['teams']}})    

    #Get New Word
    prevWord = gameData['word']
    game_collection.update_one({'name' : room}, {'$set' : {'prevWord' : prevWord }})
    game_collection.update_one({'name' : room}, {'$set' : {'word' : getWord() }})

def bufferExpired(room):

    #Load game data
    gameData = game_collection.find_one({'name' : room})

    #Set state to Buffer    
    game_collection.update_one({'name' : room}, {'$set' : {'state' : 'active'}})

    #Reset Idle Timer
    gameData['time']['idleSum'] = 0
    gameData['time']['idle'] = 0

    #Reset Buffer Timer
    gameData['time']['buffer'] = 0

    #Reset Active Timer
    gameData['time']['timeRemain'] = gameData['time']['drawLimit']
    gameData['time']['active'] = time.time()

    #Upload New Timers to Server
    game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/gamedata/', methods=['POST'])
def gameData():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):

        #Load game data
        gameData = game_collection.find_one({'name' : room})

         #Check if username exists
        isUserFound = False
        for team in gameData['teams'].keys():
            for player in gameData['teams'][team]['players']:
                if (player == user):
                    isUserFound = True

        if (isUserFound):

            #Time Processing while in-between rounds
            if gameData['state'] == 'buffer':
                currTime = time.time()
                gameData['time']['timeRemain'] = (gameData['time']['bufferLimit'] + gameData['time']['idleSum']) - (currTime - gameData['time']['buffer'])
                game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

                if (gameData['time']['timeRemain'] < 0 ):
                    bufferExpired(room)          

            #Time Processing while Active
            if gameData['state'] == 'active':
                currTime = time.time()
                gameData['time']['timeRemain'] = (gameData['time']['drawLimit'] + gameData['time']['idleSum']) - (currTime - gameData['time']['active'])
                game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

                if (gameData['time']['timeRemain'] < 0 ):
                    roundExpired(room)

            #Time Processing while Paused
            if gameData['state'] == 'paused':
                currTime = time.time()
                gameData['time']['timeRemain'] = (gameData['time']['drawLimit'] + gameData['time']['idleSum'] + (currTime - gameData['time']['idle'])) - (currTime - gameData['time']['active'])          
                game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

            gameData = game_collection.find_one({'name' : room})
            gameDataDict = json.loads(json_util.dumps(gameData))

            #Only send "Word" to drawers
            isDrawer = False
            for team in gameData['teams'].keys():
                for i,player in enumerate(gameData['teams'][team]['players']):
                    if ( (i == gameData['teams'][team]['drawIndex']) and (player == user) ):
                        isDrawer = True
            
            if (isDrawer == False):
                gameDataDict.pop('word')

            #Remove unnecessary keys
            gameDataDict.pop('code')
            gameDataDict.pop('_id')

            response = flask.jsonify({ "status" : "SUCCESS", "message" : "Game Found", "data" : gameDataDict})        
        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Player Not Found"})
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})
    print("game-data-response")
    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/hostgame/', methods=['POST'])
def hostGame():

    #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']
    code = flask.request.form['code']

    #Check for empty user / room name
    if ((room != "") and (user != "")):

        #Check if Room Name is already in use
        if (game_collection.count_documents({'name' : room}) > 0):
            response = flask.jsonify({ "status" : "FAIL", "message" : "Room Name Already Exists"})
        else:
            #Load up the template for the Game Data Model
            model = open('model.json','r+')
            tempRoom = json.loads(model.read())
            model.close()

            #Populate with request info
            tempRoom['name'] = room
            tempRoom['host'] = user
            tempRoom['code'] = code
            tempRoom['teams']['team1']['players'].append(user)

            #Upload to database
            game_collection.insert(tempRoom)

            response = flask.jsonify({ "status" : "SUCCESS", "message" : "New Room Created", "user" : user, "room" : room})
    else:
         response = flask.jsonify({ "status" : "FAIL", "message" : "User / Room Name Empty"})
    
    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/joingame/', methods=['POST'])
def joinGame():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']
    code = flask.request.form['code']

    #Check for empty username
    if (user != ""):

        #Check if Room Exists
        if (game_collection.count_documents({'name' : room}) > 0):
        
            #Load game data
            gameData = game_collection.find_one({'name' : room})

            #Check if Room Code is correct
            if (gameData['code'] == code):

                #Check if username already exists on any team
                isDuplicateUser = False
                tempPlayerList = []
                for team in gameData['teams'].keys():
                    for player in gameData['teams'][team]['players']:
                        tempPlayerList.append(player)

                for player in tempPlayerList:
                    if (user == player):
                        isDuplicateUser = True 

                if (isDuplicateUser == False):

                    #Check if game has already begun
                    if (gameData['state'] == 'lobby'):

                        #Add new player to emptiest team
                        target = 'team1'
                        if (len(gameData['teams']['team2']['players']) < len(gameData['teams']['team1']['players']) ):
                            target = 'team2'
                        elif (len(gameData['teams']['team3']['players']) < len(gameData['teams']['team2']['players']) ):
                            target = 'team3'
                        elif (len(gameData['teams']['team4']['players']) < len(gameData['teams']['team3']['players']) ):
                            target = 'team4'
                        
                        gameData['teams'][target]['players'].append(user)
                        game_collection.update_one({'name' : room}, {'$set' : {'teams' : gameData['teams']}})

                        response = flask.jsonify({ "status" : "SUCCESS", "message" : "Entered the Game Lobby", "user" : user, "room" : room})
                    else:
                        response = flask.jsonify({ "status" : "FAIL", "message" : "Game is in Progress"})           
                else:
                    response = flask.jsonify({ "status" : "SUCCESS", "message" : "Player already in Lobby", "user" : user, "room" : room})
            else:
                response = flask.jsonify({ "status" : "FAIL", "message" : "Room Code Incorrect"})     
        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Username Empty"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/jointeam/', methods=['POST'])
def joinTeam():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']
    newTeam = flask.request.form['team']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):
     
        #Load game data
        gameData = game_collection.find_one({'name' : room})

        #Check if game has already begun
        if (gameData['state'] == 'lobby'):

            #Check if username exists
            isUserFound = False
            for team in gameData['teams'].keys():
                for player in gameData['teams'][team]['players']:
                    if (player == user):

                        #Swap Teams
                        isUserFound = True
                        gameData['teams'][team]['players'].remove(user)
                        gameData['teams'][newTeam]['players'].append(user)
                        game_collection.update_one({'name' : room}, {'$set' : {'teams' : gameData['teams']}})

                        response = flask.jsonify({ "status" : "SUCCESS", "message" : "Player Changed Teams"})

            if (isUserFound == False):
                response = flask.jsonify({ "status" : "FAIL", "message" : "Player Not Found"})
        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Game is in Progress"})  
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/startgame/', methods=['POST'])
def startGame():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):

        #Load game data
        gameData = game_collection.find_one({'name' : room})

        if(gameData['host'] == user):

            if (gameData['state'] == 'lobby'):

                #Verify no 1-member teams
                minPlayerFlag = False
                for team in gameData['teams']:
                    if (len(gameData['teams'][team]['players']) == 1):
                        minPlayerFlag = True

                if (minPlayerFlag == False):

                    game_collection.update_one({'name' : room}, {'$set' : {'word' : getWord() }})

                    #Set all playing teams to Active (Drawing) [All-Play to Start]
                    for team in gameData['teams']:
                        if (len(gameData['teams'][team]['players']) > 0):                
                            gameData['teams'][team]['isActive'] = True

                    game_collection.update_one({'name' : room}, {'$set' : {'teams' : gameData['teams']}})

                    #Set state to buffer
                    game_collection.update_one({'name' : room}, {'$set' : {'state' : 'buffer'}})

                    #Start Buffer Timer
                    gameData['time']['timeRemain'] = gameData['time']['bufferLimit']
                    gameData['time']['buffer'] = time.time()
                    game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

                    response = flask.jsonify({ "status" : "SUCCESS", "message" : "Game Started" })
                else:
                    response = flask.jsonify({ "status" : "FAIL", "message" : "Non-empty Teams Must have 2+ Members" })
            else:
                response = flask.jsonify({ "status" : "FAIL", "message" : "Game is already in progress"})
        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Only Host Can Start Game"})
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/pausegame/', methods=['POST'])
def pauseGame():
   
   #Get Request Parameters
    room = flask.request.form['room']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):

        #Load game data
        gameData = game_collection.find_one({'name' : room})

        if(gameData['state'] == 'paused'):
            response = flask.jsonify({ "status" : "FAIL", "message" : "Game Already Paused"})
        else:

            #Set state to paused
            game_collection.update_one({'name' : room}, {'$set' : {'state' : 'paused'}})

            #Start Idle Timer
            gameData['time']['idle'] = time.time()
            game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

            response = flask.jsonify({ "status" : "SUCCESS", "message" : "Game Paused" })

    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/resumegame/', methods=['POST'])
def resumeGame():
   
   #Get Request Parameters
    room = flask.request.form['room']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):

        #Load game data
        gameData = game_collection.find_one({'name' : room})

        if(gameData['state'] == 'paused'):
            #Set state to active
            game_collection.update_one({'name' : room}, {'$set' : {'state' : 'active'}})

            #Update Idle Time Sum
            gameData['time']['idleSum'] += ( time.time() - gameData['time']['idle'] )
            gameData['time']['idle'] = 0

            game_collection.update_one({'name' : room}, {'$set' : {'time' : gameData['time']}})

            response = flask.jsonify({ "status" : "SUCCESS", "message" : "Game Resumed" })

        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Game Not Paused"})
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/leavegame/', methods=['POST'])
def leaveGame():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):
     
        #Load game data
        gameData = game_collection.find_one({'name' : room})

        #Check if username exists
        isUserFound = False
        for team in gameData['teams'].keys():
            for player in gameData['teams'][team]['players']:
                if (player == user):

                    #Remove Player
                    isUserFound = True
                    gameData['teams'][team]['players'].remove(user)
                    game_collection.update_one({'name' : room}, {'$set' : {'teams' : gameData['teams']}})

                    response = flask.jsonify({ "status" : "SUCCESS", "message" : "Left Game"})

        if (isUserFound == False):
            response = flask.jsonify({ "status" : "FAIL", "message" : "Player Not Found"})
 
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/disbandgame/', methods=['POST'])
def disbandGame():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']

    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):

        #Load game data
        gameData = game_collection.find_one({'name' : room})

        if(gameData['host'] == user):
            
            #Delete Document in DB
            game_collection.delete_one({'name' : room})

            response = flask.jsonify({ "status" : "SUCCESS", "message" : "Game Disbanded" })

        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Only Host Can Disband Game"})
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response

@app.route('/guess/', methods=['POST'])
def guess():
   
   #Get Request Parameters
    room = flask.request.form['room']
    user = flask.request.form['user']
    team = flask.request.form['team']
    guess = flask.request.form['guess']


    #Check if Room Exists
    if (game_collection.count_documents({'name' : room}) > 0):
     
        #Load game data
        gameData = game_collection.find_one({'name' : room})

        #Can only guess while game is active (not paused)
        if (gameData['state'] == 'active'):

            #Can only guess if a team is active
            if (gameData['teams'][team]['isActive']):

                #Verify user is on the team and not the drawer
                isTeamMember = False
                for i,player in enumerate(gameData['teams'][team]['players']):
                    if (player == user):
                        isTeamMember = True
                        if (i == gameData['teams'][team]['drawIndex']):
                            response = flask.jsonify({ "status" : "FAIL", "message" : "Guesser is also Drawer for Team"})
                        else:
                            if (guess.lower() == gameData['word'].lower()):
                                response = flask.jsonify({ "status" : "SUCCESS", "message" : "Guess is Correct"})
                                guessedCorrectly(room,team)
                            else:
                                response = flask.jsonify({ "status" : "FAIL", "message" : "Guess is Incorrect"})
                if (isTeamMember == False):
                    response = flask.jsonify({ "status" : "FAIL", "message" : "Guesser is not on this Team"})
            else:
                response = flask.jsonify({ "status" : "FAIL", "message" : "This Team is not active"})
        else:
            response = flask.jsonify({ "status" : "FAIL", "message" : "Game State is not active"})
    else:
        response = flask.jsonify({ "status" : "FAIL", "message" : "Room Does Not Exist"})

    response.headers.add('Access-Control-Allow-Origin', '*')    
    return response


if __name__ == '__main__':
    app.run(threaded=True,host='0.0.0.0')