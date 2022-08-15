import CONFIG from "../../config";
import { LevelManager } from "./level";
import NetworkManager from "./network";

export var multiplayerManager = MultiplayerManager.getInstance();

export default class MultiplayerManager {
	static getInstance() {
		if (multiplayerManager == null) {
			multiplayerManager = new MultiplayerManager();
		}
		return multiplayerManager;
	}

	constructor() {
		let baseURL = CONFIG.baseURL;
   		let wsURLbase = baseURL.substring(baseURL.indexOf("://") + 3);

        this.networkManager = NetworkManager.getInstance();
        this.levelManager   = LevelManager.getInstance();

        // 
		this.multiplayerSocket = new WebSocket("ws://" + wsURLbase + "multiplayer");
    }


    addOnMessage(callback) {
        this.multiplayerSocket.addEventListener("message", callback);
    }

    addOnOpen(callback) {
        this.multiplayerSocket.addEventListener("open", callback);
    }

    addOnError(callback) {
        this.multiplayerSocket.addEventListener("error", callback);
    }


    
}