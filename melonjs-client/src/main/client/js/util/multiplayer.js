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
	BROADCAST_CHAT  : "BROADCAST_CHAT",
};
export class MultiplayerMessage {
    
    static gameUpdate() {
        let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_UPDATE);
        mm.playerId = multiplayerManager.multiplayerPlayer.id;
        mm.gameId   = multiplayerManager.multiplayerGame.id;
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
        if( this.multiplayerSocket !== null ) {
            this.multiplayerSocket.close();
            this.multiplayerSocket = null;
        }

        this.multiplayerSocket = new WebSocket("ws://" + this.socketBaseURL + "multiplayer/" + this.multiplayerGame.id + "/" + this.multiplayerPlayer.id);        
        this.multiplayerSocket.addEventListener("error", (evt) => {
            console.log("  Socket error: " + evt);
        });      

        this.multiplayerSocket.addEventListener("message", (evt) => {
            console.log(  "Got message from server: " + JSON.stringify(evt.data));
        });
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

            
            this.multiplayerSocket = new WebSocket("ws://" + this.socketBaseURL + "multiplayer/" + this.multiplayerGameToJoin.id + "/" + this.multiplayerPlayer.id);
            this.multiplayerSocket.addEventListener("error", (evt) => {
                console.log("  Socket error: " + evt);
            });

            this.multiplayerSocket.addEventListener("message", (evt) => {
                const message = JSON.parse(evt.data);
                if( message.type === MultiplayerMessageType.PLAYER_JOINED)
                console.log("Got message from server: " + message.type);
            });
            this.weAreHost = false;
        }
    }

    /**
     * 
     * @returns a array of open games coming from server to join them
     */
    async listOpenGames() {
        let res = await fetch(this.listGamesURL);
        return res.json();
    }

    
    removeOnMessage(callback) {
        this.multiplayerSocket.removeEventListener("message", callback);
    }

    addOnMessage(callback) {
        this.multiplayerSocket.addEventListener("message", callback);
    }

    removeOnOpen(callback) {
        this.multiplayerSocket.removeEventListener("open", callback);
    }
    addOnOpen(callback) {
        this.multiplayerSocket.addEventListener("open", callback);
    }

    removeOnError(callback) {
        this.multiplayerSocket.removeEventListener("error", callback);
    }

    addOnError(callback) {
        this.multiplayerSocket.addEventListener("error", callback);
    }

    /**
     * Uses the levelIndex as selected level to start a multiplayer game
     * @param {number} levelIndex 
     */
    useSelectedLevel(levelIndex) {
        this.selectedLevelIndex = levelIndex;
        this.selectedLevelForGame = this.levelManager.allMuiltiplayerLevels()[levelIndex];
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