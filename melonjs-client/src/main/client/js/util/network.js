import CONFIG from "../../config";
import GlobalGameState from "./global-game-state";
import { LevelManager } from "./level";

var networkManager = null;
export default class NetworkManager {
	static getInstance() {
		if (networkManager == null) {
			networkManager = new NetworkManager();
		}
		return networkManager;
	}

	// server settings
	readHighscoreURL = null;
	createGameURL = null;
	writeScoreURL = null;
	writePlayerMovementURL = null;
	readPlayerMovementsURL = null;
	fakeNameURL = null;

	// buffer of player actions 
	BUFFER_SIZE = 50;
	playerActions = [];

	constructor() {
		let baseURL = CONFIG.baseURL;
		this.readHighscoreURL = baseURL + "highscore/10";
		this.writeScoreURL = baseURL + "highscore";
		this.createGameURL = baseURL + "game";
		this.fakeNameURL = baseURL + "faker";
		this.writePlayerMovementURL = baseURL + "movement";
		this.readPlayerMovementsURL = baseURL + "movement/";

		this.playerActions = [];
	}

	async readTop10Highscores() {
		let res = await fetch(this.readHighscoreURL);
		return res.json();
	}

	/**
	 * Writes a new score to the server
	 *
	 */
	async writeHighscore() {
		// store another entry in Hightscores
		let score = {
			playerId: GlobalGameState.globalServerGame.player.id,
			gameId: GlobalGameState.globalServerGame.id,
			score: GlobalGameState.score,
			placedBarriers: GlobalGameState.placedBarriers,
			usedBombs: GlobalGameState.usedBombs,
			bittenBySpiders: GlobalGameState.bittenBySpiders,
			catchedByCats: GlobalGameState.catchedByCats,
			catchedByGolems: GlobalGameState.catchedByGolems,
			killedSpiders: GlobalGameState.killedSpiders,
			stunnedCats: GlobalGameState.stunnedCats,
			stunnedGolems: GlobalGameState.stunnedGolems,
			bonusCollected: GlobalGameState.bonusCollected,
			level: LevelManager.getInstance().getCurrentLevelIndex() + 1,
			name: GlobalGameState.globalServerGame.player.name,
		};

		fetch(this.writeScoreURL, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(score),
		});
	}

	/**
	 * Writes a new player action to the server. A player action consists of
	 * - Movement
	 * - Barriers
	 * - Bombs
	 * - GameOver
	 * - LevelWon
	 *
	 * @param {*} action the action to write
	 * @param {boolean} flush flush the cache
	 */
	async writePlayerAction(action, flush = false) {
		if( action !== null ) this.playerActions.push(action);
		if( flush || this.playerActions.length > this.BUFFER_SIZE ) {
			console.log("need to flush buffer");
			if( this.playerActions.length == 0 ) {
				console.log("  nothing to flush");
				return;
			}
			let body = JSON.stringify(this.playerActions);
			this.playerActions = [];

			fetch(this.writePlayerMovementURL + "/" + GlobalGameState.globalServerGame.id + "/" + GlobalGameState.globalServerGame.player.id, {
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json",
				},
				body: body,
			});
		}
	}

	/**
	 * Create a new game on the server. Initially, it also creates 
	 * a new player with a random fake name.
	 */
	async createGameOnServer() {
		// if this is the first call, initialize server version etc.
		let name;
		let resp;
		let req = {
			name: name,
			level: "0",
			player: {
				name: name,
			},
		};

		if( GlobalGameState.globalServerVersion === null ) {
			resp = await fetch(this.fakeNameURL);
			name = await resp.text();
			console.log("name: " + name);

			resp = await fetch(this.createGameURL + "/version");
			GlobalGameState.globalServerVersion = await resp.json();
		}

		if( GlobalGameState.globalServerGame !== null ) {
			req.level = LevelManager.getInstance().getCurrentLevelIndex() + 1;
			req.name  = LevelManager.getInstance().getCurrentLevel().longName;
			req.player= GlobalGameState.globalServerGame.player;
		}
		else {
			req.name = name;
			req.player.name = name;
		}
		
		req = JSON.stringify(req);		
		resp = await fetch(this.createGameURL, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: req,
		});

		GlobalGameState.globalServerGame = await resp.json();
		console.log("   Server API: " + JSON.stringify(GlobalGameState.globalServerVersion));
		console.log("   New game  : " + JSON.stringify(GlobalGameState.globalServerGame));
	}

	async readLastGamesFromServer() {
		let resp = await fetch(this.createGameURL, {
			method: "GET",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
		});

		return resp.json();
	}
}