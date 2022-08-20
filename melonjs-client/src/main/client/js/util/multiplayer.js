import CONFIG from "../../config";
import { EventEmitter } from "./eventemitter";
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
    GAME_OVER       : "GAME_OVER",
	BROADCAST_CHAT  : "BROADCAST_CHAT",
    ERROR           : "ERROR",
    PLAYER_GAVE_UP  : "PLAYER_GAVE_UP",
    GAME_PAUSED     : "PLAYER_PAUSED_GAME",
};
export class MultiplayerMessage {
	static gameUpdate() {
		let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_UPDATE);
		mm.playerId = multiplayerManager.multiplayerPlayer.id;
		mm.gameId = multiplayerManager.multiplayerGame.id;
		return mm;
	}

	static gameStarted() {
		let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_STARTED);
		mm.gameId = multiplayerManager.multiplayerGame.id;
		mm.playerId = multiplayerManager.multiplayerPlayer.id;
		return mm;
	}

	static gameOver() {
		let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_OVER);
		mm.gameId = multiplayerManager.multiplayerGame.id;
		mm.playerId = multiplayerManager.multiplayerPlayer.id;
		return mm;
	}

	static giveUp() {
		let mm = new MultiplayerMessage(MultiplayerMessageType.PLAYER_GAVE_UP);
		mm.gameId = multiplayerManager.multiplayerGame.id;
		mm.playerId = multiplayerManager.multiplayerPlayer.id;
		mm.message = multiplayerManager.multiplayerPlayer.name + " gave up!";
		return mm;
	}

	static pauseGame(isPaused) {
		let mm = new MultiplayerMessage(MultiplayerMessageType.GAME_PAUSED);
		mm.gameId = multiplayerManager.multiplayerGame.id;
		mm.playerId = multiplayerManager.multiplayerPlayer.id;
		mm.message = multiplayerManager.multiplayerPlayer.name + " PAUSED Game";
        mm.isPaused = isPaused;
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
        
		this.levelOver = false;
		this.hasChanged = false;

        this.isPaused = false;
	}
}

 export default class MultiplayerManager {
		static get() {
			if (multiplayerManager == null) {
				multiplayerManager = new MultiplayerManager();
			}
			return multiplayerManager;
		}

		constructor() {
			let baseURL = CONFIG.baseURL;

			this.networkManager = NetworkManager.getInstance();
			this.levelManager = LevelManager.getInstance();

			// define URLs for the REST services
			this.createPlayerURL = baseURL + "mp-game/player";
			this.createGameURL = baseURL + "mp-game/new";
			this.joinGameURL = baseURL + "mp-game/join/"; // append gameId
			this.listGamesURL = baseURL + "mp-game/open";
			this.closeGameURL = baseURL + "mp-game/close/"; // append gameId/playerId
			this.getGameURL = baseURL + "mp-game/"; // append gameId
			this.startGameURL = baseURL + "mp-game/start/"; // append gameId

			// the websocket
			this.multiplayerSocket = null;
			this.socketBaseURL = baseURL.substring(baseURL.indexOf("://") + 3);

			// game and player
			this.multiplayerGame = null;
			this.multiplayerPlayer = null;

			this.selectedLevelForGame = null;
			this.selectedLevelIndex = 0;
			this.multiplayerLevels = this.levelManager.allMultiplayerLevels();
			this.weAreHost = false;
			this.multiplayerGameToJoin = null;

			// callbacks for socket
			this.eventEmitter = new EventEmitter();
		}

		/**
		 *
		 * @returns Returns initialized multiplayerPlayer
		 */
		async createPlayerFromMe() {
			if (this.multiplayerPlayer === null || this.multiplayerPlayer.id === null) {
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
		 * Closes the current active game, weather it is a host or just a player.
		 * It clears everything from this manager so it's save to call this method and
		 * then createGame() or joinGame().
		 */
		async closeActiveGame() {
			if (this.multiplayerSocket !== null && this.multiplayerSocket.readyState !== 3) {
				this.multiplayerSocket.close();
				this.multiplayerSocket = null;
			}

			this.eventEmitter.reset();

			if (this.multiplayerGame !== null) {
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

			this.eventEmitter.reset();
		}

		/**
		 * Creates the multiplayer game and initializes the serverSocket to communicate
		 * with other clients.
		 *
		 * @returns the initialized MultiplayerGame
		 */
		async createGame() {
			if (this.multiplayerGame !== null) {
				await this.closeActiveGame();
			}
			if (this.multiplayerPlayer === null) {
				await this.createPlayerFromMe();
			}

			const req = {
				game: {
					level: this.selectedLevelIndex,
				},
				host: this.multiplayerPlayer,
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

		/**
		 * Notify other clients that we're going to start now!
		 */
		async sendGameStarted() {
			let mm = MultiplayerMessage.gameStarted();
			this.sendAction(mm);
		}

		/**
		 * Notify other clients that this game is over now
		 */
		async sendGameOver() {
			let mm = MultiplayerMessage.gameOver();
			this.sendAction(mm);
		}

		async sendPlayerGiveUp() {
			let mm = MultiplayerMessage.giveUp();
			this.sendAction(mm);
		}

        async sendPlayerPaused(isPaused) {
            let mm = MultiplayerMessage.pauseGame(isPaused);
            this.sendAction(mm);
        }

		/**
		 * Update server to indicate that this game does not accept any more
		 * players. Notify other players that we are starting NOW
		 */
		async startGame() {
			if (this.weAreHost) {
				await fetch(this.startGameURL + this.multiplayerGame.id, {
					method: "PUT",
					mode: "cors",
				});
				this.sendGameStarted();
			}
		}

		/**
		 * Joins the selected game as player
		 *
		 */
		async joinGame() {
			if (this.multiplayerGame !== null) {
				await this.closeActiveGame();
			}

			if (this.multiplayerPlayer === null) {
				await this.createPlayerFromMe();
			}

			if (this.multiplayerGameToJoin !== null) {
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

				this.multiplayerGame = await res.json();
				this._createMultiplayerSocket();
				this.weAreHost = false;
				this.multiplayerGameToJoin = null;
			}
		}

		/**
		 * Creates the WebSocket to talk to server and other clients
		 */
		_createMultiplayerSocket() {
			if (this.multiplayerSocket !== null) {
				this.multiplayerSocket.close();
				this.multiplayerSocket = null;
			}

			this.multiplayerSocket = new WebSocket("ws://" + this.socketBaseURL + "multiplayer/" + this.multiplayerGame.id + "/" + this.multiplayerPlayer.id);
			this.multiplayerSocket.addEventListener("error", (evt) => {
				console.log("  Socket error: " + evt);
				this.eventEmitter.emit(MultiplayerMessageType.ERROR, evt);
			});

			this.multiplayerSocket.addEventListener("message", (evt) => {
				const data = JSON.parse(evt.data);

				switch (data.type) {
					case MultiplayerMessageType.PLAYER_JOINED:
						console.log("  Player " + data.playerId + " joined the game:  " + data.message);
						fetch(this.getGameURL + data.gameId)
							.then((res) => {
								return res.json();
							})
							.then((json) => {
								this.multiplayerGame = json;
								this.eventEmitter.emit(data.type, {
									message: data,
									game: json,
								});
							});
						break;

					case MultiplayerMessageType.PLAYER_GAVE_UP:
					case MultiplayerMessageType.PLAYER_REMOVED:
						console.log("  Player " + data.playerId + " removed from game: " + data.message);
						fetch(this.getGameURL + data.gameId)
							.then((res) => {
								return res.json();
							})
							.then((json) => {
								this.multiplayerGame = json;

								this.eventEmitter.emit(data.type, {
									message: data,
									game: json,
								});
							});
						break;

					case MultiplayerMessageType.CLOSE_GAME:
						console.log("  Game is going to be closed now: " + data.message);
						this.closeActiveGame().then(() => {
							this.eventEmitter.emit(data.type, {
								message: data,
							});
						});
						break;

					case MultiplayerMessageType.GAME_STARTED:
						console.log("  Game will be started now: " + data.message);
						fetch(this.getGameURL + data.gameId)
							.then((res) => {
								return res.json();
							})
							.then((json) => {
								this.multiplayerGame = json;
								this.eventEmitter.emit(data.type, {
									message: data,
									game: json,
								});
							});
						break;

					default:
						// all other messages will be just thrown over to the mp-play.js
						this.eventEmitter.emit(data.type, {
							message: data,
						});
						break;
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

		/**
		 * Adds a new listener to the event emitter
		 *
		 * @param {MultiplayerMessageType} type the type of event to listen to
		 * @param {*} callback the method to be called, can be a async function
		 * @param {*} context  the context (this) to be used
		 * @returns the callback which was registered
		 */
		addEventListener(type, callback, context) {
			if (typeof type === "string") {
				this.eventEmitter.on(type, callback, context);
			} else if (type instanceof Array) {
				for (let i = 0; i < type.length; i++) {
					this.eventEmitter.on(type[i], callback, context);
				}
			}
			return callback;
		}

		/**
		 * Removes a listener from the event emitter
		 *
		 * @param {MultiplayerMessageType} type
		 * @param {*} callback the callback to be removed
		 */
		removeEventListener(type, callback) {
			if (callback === null) {
				this.removeAllEventListeners(type);
			} else {
				if (typeof type === "string") {
					this.eventEmitter.off(type, callback);
				} else if (type instanceof Array) {
					for (let i = 0; i < type.length; i++) {
						this.eventEmitter.off(type[i], callback);
					}
				}
			}
		}

		/**
		 * Remove all listeners of a given type
		 *
		 * @param {MultiplayerMessageType} type remove all listeners of this type
		 */
		removeAllEventListeners(type) {
			if (typeof type === "string") {
				this.eventEmitter.allOff(type);
			} else if (type instanceof Array) {
				for (let i = 0; i < type.length; i++) {
					this.eventEmitter.allOff(type[i]);
				}
			}
		}

        /**
         * clears the event emitter (resets it)
         */
		clearAllEventListeners() {
            this.eventEmitter.reset();
        }

		/**
		 * Add onMessage callback listener
		 * @param {*} callback method to call
		 * @param {*} context (this)
		 */
		addOnMessageCallback(callback, context) {
			if (callback !== null) {
				this.eventEmitter.on(MultiplayerMessageType.GAME_UPDATE, callback, context);
			} else {
				this.eventEmitter.allOff(MultiplayerMessageType.GAME_UPDATE);
			}
		}

		/**
		 * adds a listener for other players to join
		 * @param {*} callback
		 */
		setOnJoinCallback(callback, context) {
			if (callback) this.eventEmitter.on(MultiplayerMessageType.PLAYER_JOINED, callback, context);
			else this.eventEmitter.allOff(MultiplayerMessageType.PLAYER_JOINED);
		}

		/**
		 * Sets a listener for other players to leave that game
		 * @param {*} callback
		 */
		setOnLeaveCallback(callback, context) {
			if (callback) {
				this.eventEmitter.on(MultiplayerMessageType.PLAYER_REMOVED, callback, context);
			} else {
				this.eventEmitter.allOff(MultiplayerMessageType.PLAYER_REMOVED);
			}
		}

		/**
		 * Sets a listener for ERROR events
		 * @param {*} callback
		 */
		setOnErrorCallback(callback) {
			if (callback) {
				this.eventEmitter.on(MultiplayerMessageType.ERROR, callback);
			} else {
				this.eventEmitter.allOff(MultiplayerMessageType.ERROR);
			}
		}

		/**
		 *
		 * @param {*} callback
		 */
		setOnGameCloseCallback(callback, context) {
			if (callback) this.eventEmitter.on(MultiplayerMessageType.CLOSE_GAME, callback, context);
			else this.eventEmitter.allOff(MultiplayerMessageType.CLOSE_GAME);
		}

		/**
		 *
		 * @param {*} callback
		 */
		setOnBroadcastCallback(callback) {
			if (callback) this.eventEmitter.on(MultiplayerMessageType.BROADCAST_CHAT, callback);
			else this.eventEmitter.allOff(MultiplayerMessageType.BROADCAST_CHAT);
		}

		/**
		 *
		 * @param {*} callback
		 */
		setOnGameStartedCallback(callback, context) {
			if (callback) this.eventEmitter.on(MultiplayerMessageType.GAME_STARTED, callback, context);
			else this.eventEmitter.allOff(MultiplayerMessageType.GAME_STARTED);
		}

		/**
		 *
		 * @param {*} callback
		 */
		setOnGameOverCallback(callback, context) {
			if (callback) this.eventEmitter.on(MultiplayerMessageType.GAME_OVER, callback, context);
			else this.eventEmitter.allOff(MultiplayerMessageType.GAME_OVER);
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