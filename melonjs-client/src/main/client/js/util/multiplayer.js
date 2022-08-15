import CONFIG from "../../config";
import GlobalGameState from "./global-game-state";
import { LevelManager } from "./level";
import NetworkManager from "./network";

//let mm = MultiplayerManager.getInstance();
let multiplayerManager = null;

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
        
        // the websocket
        this.multiplayerSocket = null;      
   		this.socketBaseURL = baseURL.substring(baseURL.indexOf("://") + 3);
  
    }

    async createPlayerFromMe() {
        let res = await fetch(this.createPlayerURL, {
					method: "POST",
					mode: "cors",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(GlobalGameState.globalServerGame.player),
		});

        return res.json();
    }

    async createGame(level) {
        const req = {
            game: {
                level: level,
            },
            host: GlobalGameState.multiplayerPlayer
        };

        let res = await fetch(this.createGameURL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req),
        });

        let game = await res.json(); 
        GlobalGameState.multiplayerGame = game;
        if( this.multiplayerSocket != null ) {
            this.multiplayerSocket.close();
        }

        this.multiplayerSocket = new WebSocket("ws://" + this.socketBaseURL + "multiplayer/" + game.id + "/" + GlobalGameState.multiplayerPlayer.id);        
    }

    async joinGame(multiPlayer, game) {

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