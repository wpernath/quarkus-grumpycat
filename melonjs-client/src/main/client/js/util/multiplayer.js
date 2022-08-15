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
    }

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

    async closeActiveGame() {
        if( this.multiplayerSocket !== null && this.multiplayerSocket.readyState !== 3) {
            this.multiplayerSocket.close();
            this.multiplayerSocket = null;
        }
        if( this.multiplayerGame !== null ) {
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

    async createGame(level) {
        if( this.multiplayerGame !== null ) {
            await this.closeActiveGame();
        }
        if( this.multiplayerPlayer === null ) {
            await this.createPlayerFromMe();
        }

        const req = {
            game: {
                level: level,
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

        });      

        return this.multiplayerGame;
    }

    async sendAction(action) {
        this.multiplayerSocket.send(JSON.stringify(action));
    }

    async joinGame(game) {

    }

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


    
}