import CONFIG from "../../config";
import GlobalGameState from "./global-game-state";
import { LevelManager } from "./level";
import NetworkManager from "./network";

//let mm = MultiplayerManager.getInstance();
let multiplayerManager = null;

export const MultiplayerMessageType = {
	PLAYER_JOINED   : "PLAYER_JOINED",
	PLAYER_REMOVED  : "PLAYER_REMOVED",
	START_GAME      : "START_GAME",
	CLOSE_GAME      : "CLOSE_GAME",
	GAME_UPDATE     : "GAME_UPDATE",
    GAME_STARTED    : "GAME_STARTED",
	BROADCAST_CHAT  : "BROADCAST_CHAT",
};
export class MultiplayerMessage {
    
    static gameUpdate() {
        let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_UPDATE);
        mm.playerId = multiplayerManager.multiplayerPlayer.id;
        mm.gameId   = multiplayerManager.multiplayerGame.id;
        return mm;
    }    

    static gameStarted() {
        let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_STARTED);
        mm.gameId = multiplayerManager.multiplayerGame.id;
        mm.playerId = multiplayerManager.multiplayerPlayer.id;
        return mm;
    }

    constructor(type) {
        this.type = type;
        this.message = null;

        this.playerId = null;
        this.gameId = null;

        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.bombPlaced = false;
        this.gutterThrown = false;
        this.score = 0;
        this.energy = 0;
    }    
}

 export default class MultiplayerManager {
	static getInstance() {
		if (multiplayerManager == null) {
			multiplayerManager = new MultiplayerManager();
		}
		return multiplayerManager;
	}

	constructor() {
		let baseURL = CONFIG.baseURL;
   
        this.networkManager = NetworkManager.getInstance();
        this.levelManager   = LevelManager.getInstance();

        // define URLs for the REST services
        this.createPlayerURL= baseURL + "mp-game/player";
        this.createGameURL  = baseURL + "mp-game/new";
        this.joinGameURL    = baseURL + "mp-game/join/"; // append gameId
        this.listGamesURL   = baseURL + "mp-game/open";
        this.closeGameURL   = baseURL + "mp-game/close/"; // append gameId/playerId
        this.getGameURL     = baseURL + "mp-game/" // append gameId
        
        // the websocket
        this.multiplayerSocket = null;      
   		this.socketBaseURL = baseURL.substring(baseURL.indexOf("://") + 3);
  
        // game and player
        this.multiplayerGame   = null;
        this.multiplayerPlayer = null;

        this.selectedLevelForGame = null;
        this.selectedLevelIndex   = 0;
        this.multiplayerLevels    = this.levelManager.allMultiplayerLevels();
        this.weAreHost            = false;
        this.multiplayerGameToJoin= null;

        // callbacks for socket
        this.onErrorCallback = null;
        this.onLeaveCallback = null;
        this.onJoinCallback  = null;
        this.onMessageCallback = null;
        this.onGameCloseCallback = null;
        this.onBroadcastCallback = null;
        this.onGameStartedCallback = null;
    }

    /**
     * 
     * @returns Returns initialized multiplayerPlayer
     */
    async createPlayerFromMe() {
        if( this.multiplayerPlayer === null || this.multiplayerPlayer.id === null ) {
            let res = await fetch(this.createPlayerURL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(GlobalGameState.globalServerGame.player),
            });

            this.multiplayerPlayer = await res.json();                        
        }
        return this.multiplayerPlayer;
    }

    /**
     * Closes the current active game, weather it is a host or just a player
     */
    async closeActiveGame() {
        if( this.multiplayerSocket !== null && this.multiplayerSocket.readyState !== 3) {
            this.multiplayerSocket.close();
            this.multiplayerSocket = null;

            this.onBroadcastCallback = null;
            this.onErrorCallback = null;
            this.onGameCloseCallback = null;
            this.onGameStartedCallback = null;
            this.onJoinCallback = null;
            this.onLeaveCallback = null;
            this.onMessageCallback = null;
        }
        if( this.multiplayerGame !== null ) {
            this.weAreHost = false;
            console.log("CLOSING: ");
            console.log("  Game  : " + this.multiplayerGame.id);
            console.log("  Player: " + this.multiplayerPlayer.id);
            let res = await fetch(this.closeGameURL + this.multiplayerGame.id + "/" + this.multiplayerPlayer.id, {
                method: "PUT",
                mode: "cors",
            }); 

            this.multiplayerGame = null;
        }        
    }

    /**
     * Creates the multiplayer game and initializes the serverSocket to communicate
     * with other clients.
     * 
     * @returns the initialized MultiplayerGame
     */
    async createGame() {
        if( this.multiplayerGame !== null ) {
            await this.closeActiveGame();
        }
        if( this.multiplayerPlayer === null ) {
            await this.createPlayerFromMe();
        }

        const req = {
            game: {
                level: this.selectedLevelIndex,
            },
            host: this.multiplayerPlayer
        };

        let res = await fetch(this.createGameURL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req),
        });

        this.multiplayerGame = await res.json(); 
        
        console.log("  Created new MultiplayerGame: " + this.multiplayerGame.id);
        this._createMultiplayerSocket();

        this.weAreHost = true;
        return this.multiplayerGame;
    }

    /**
     * Sends the given action to the server so that all clients will recieve the update
     * 
     * @param {MultiplayerMessage} action 
     */
    async sendAction(action) {
        this.multiplayerSocket.send(JSON.stringify(action));
    }

    async sendGameStarted() {
        let mm = MultiplayerMessage.gameStarted();
        this.sendAction(mm);

    }

    /**
     * Joins the selected game as player
     *
     */
    async joinGame() {
        if( this.multiplayerGame !== null ) {
            await this.closeActiveGame();
        }

        if( this.multiplayerPlayer === null ) {
            await this.createPlayerFromMe();
        }

        if( this.multiplayerGameToJoin !== null ) {
            console.log("  Joining multi player game: " + this.multiplayerGameToJoin.id);
            if (this.multiplayerSocket !== null) {
                this.multiplayerSocket.close();
                this.multiplayerSocket = null;
            }

            let res = await fetch(this.joinGameURL + this.multiplayerGameToJoin.id + "/" + this.multiplayerPlayer.id, {
                method: "PUT",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            this.multiplayerGame = this.multiplayerGameToJoin;
            this._createMultiplayerSocket();
            this.weAreHost = false;            
            this.multiplayerGameToJoin = null;
        }
    }

    _createMultiplayerSocket() {
        if (this.multiplayerSocket !== null) {
            this.multiplayerSocket.close();
            this.multiplayerSocket = null;
        }

        this.multiplayerSocket = new WebSocket("ws://" + this.socketBaseURL + "multiplayer/" + this.multiplayerGame.id + "/" + this.multiplayerPlayer.id);
        this.multiplayerSocket.addEventListener("error", (evt) => {
            console.log("  Socket error: " + evt);
            if( this.onErrorCallback !== null ) {
                this.onErrorCallback(evt);
            }
        });

        this.multiplayerSocket.addEventListener("message", (evt) => {
            const data = JSON.parse(evt.data);
            console.log("Got message from server: " );
            if( data.type === MultiplayerMessageType.PLAYER_JOINED ) {
                console.log("  Player " + data.playerId + " joined the game:  " + data.message);
                fetch(this.getGameURL + data.gameId)
                    .then( (res) => {
                        return res.json();
                    })
                    .then( (json) => {
                        this.multiplayerGame = json;
                        if( this.onJoinCallback !== null ) {
                            this.onJoinCallback(data, json);
                        }
                    });                
            }            
            else if( data.type === MultiplayerMessageType.PLAYER_REMOVED ) {
                console.log("  Player " + data.playerId + " removed from game: " + data.message);
                fetch(this.getGameURL + data.gameId)
                    .then((res) => {
                        return res.json();
                    })
                    .then((json) => {
                        this.multiplayerGame = json;

                        if (this.onLeaveCallback !== null) {
                            this.onLeaveCallback(data, json);
                        }
                    });                
            }
            else if( data.type === MultiplayerMessageType.CLOSE_GAME ) {
                console.log("  Game is going to be closed now: " + data.message);
                this.closeActiveGame().then( () => {
                    if( this.onGameCloseCallback !== null ) {
                        this.onGameCloseCallback(data);
                    }
                });
            }
            else if( data.type === MultiplayerMessageType.GAME_STARTED) {
                console.log("  Game will be started now: " + data.message);
                fetch(this.getGameURL + data.gameId)
                    .then((res) => {
                        return res.json();
                    })
                    .then((json) => {
                        this.multiplayerGame = json;

                        if (this.onGameStartedCallback !== null) {
                            this.onGameStartedCallback(data, json);
                        }
                    });                
            }
            else if( data.type === MultiplayerMessageType.BROADCAST_CHAT) {
                console.log("  [BROADCAST]: " + data.message);
                if( this.onBroadcastCallback !== null ) {
                    this.onBroadcastCallback(data);
                }
            }
            else if( data.type === MultiplayerMessageType.GAME_UPDATE) {
                // sending game update to game screen
                if( this.onMessageCallback !== null ) {
                    this.onMessageCallback(data);
                }
            }
        });

    }
    /**
     * 
     * @returns a array of open games coming from server to join them
     */
    async listOpenGames() {
        let res = await fetch(this.listGamesURL);
        return res.json();
    }

    
    setOnMessageCallback(callback) {
        this.onMessageCallback = callback;
    }

    setOnJoinCallback(callback) {
        this.onJoinCallback = callback;
    }

    setOnLeaveCallback(callback) {
        this.onLeaveCallback = callback;
    }
    
    setOnErrorCallback(callback) {
        this.onErrorCallback = callback;
    }

    setOnGameCloseCallback(callback) {
        this.onGameCloseCallback = callback;
    }

    setOnBroadcastCallback(callback) {
        this.onBroadcastCallback = callback;
    }

    setOnGameStartedCallback(callback) {
        this.onGameStartedCallback = callback;
    }

    /**
     * Uses the levelIndex as selected level to start a multiplayer game
     * @param {number} levelIndex 
     */
    useSelectedLevel(levelIndex) {
        this.selectedLevelIndex = levelIndex;
        this.selectedLevelForGame = this.levelManager.allMultiplayerLevels()[levelIndex];
    }

    /**
     * 
     * @returns array of all multiplayerLevels 
     */
    allLevels() {       
        console.log("MultiplayerManager.allLevels() => " + this.multiplayerLevels.length); 
        return this.multiplayerLevels;
    }

    setGameToJoin(game) {
        this.multiplayerGameToJoin = game;
    }
    
}