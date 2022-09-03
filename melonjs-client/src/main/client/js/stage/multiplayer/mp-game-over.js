import { Stage, game, input, Sprite, Color, loader, event, state, Container, Vector2d, BitmapText, ParticleEmitter, RoundRect, Rect } from "melonjs/dist/melonjs.module.js";
import { LevelManager } from "../../util/level";
import GlobalGameState from "../../util/global-game-state";
import MultiplayerManager from "../../util/multiplayer";
import { StateBackground } from "../state_background";
import { my_state, PLAYER_COLORS } from "../../util/constants";
import PlayerEntity from "../../renderables/player";
class PlayerStatistics extends Container {
	constructor(x, y, width, height, player, tint) {
		super(x, y, width, height);
		this.player = player;
		this.border = new RoundRect(x, y, width, height);
		this.divider = new Rect(x+4, y+42, width-8, 2);
		this.playerEntity = new PlayerEntity(0, 0, true);
		this.playerEntity.tint.copy(tint);

		this.levelName = new BitmapText(36, 2, {
			font: "18Outline",
			fillStyle: tint,
			textAlign: "left",
			text: player.name + "\nStatistics:",
		});

		let textL =
			"Score: \n" +
			"Real Score: \n" +
			"Energy left: \n" +
			"Bonus collected: " +
			"\n" +
			"Bombs left: " +
			"\n" +
			"Used bombs: " +
			"\n" +
			"Placed barriers: " +
			"\n" +
			"Bitten by spiders: " +
			"\n" +
			"Catched by cats: " +
			"\n" +
			"Catched by golems: " +
			"\n" +
			"Killed spiders: " +
			"\n" +
			"Stunned cats: " +
			"\n" +
			"Stunned golems: " +
			"\n" +
			"";

		let textR =
			player.score +
			"\n" +
			player.internalScore +
			"\n" +
			player.energyLeft + 
			"\n" +
			player.bonusCollected +
			"\n" +
			player.bombsLeft +
			"\n" +
			player.usedBombs +
			"\n" +
			player.placedBarriers +
			"\n" +
			player.bittenBySpiders +
			"\n" +
			player.catchedByCats +
			"\n" +
			player.catchedByGolems +
			"\n" +
			player.killedSpiders +
			"\n" +
			player.stunnedCats +
			"\n" +
			player.stunnedGolems +
			"\n" +
			"";

		this.levelDescr = new BitmapText(6, 50, {
			font: "12Outline",
			textAlign: "left",
			text: textL,
		});

		this.levelDescr2 = new BitmapText(200, 50, {
			font: "12Outline",
			textAlign: "right",
			text: textR,
		});


		this.addChild(this.playerEntity, 1);
		this.addChild(this.levelName, 1);
		this.addChild(this.levelDescr, 1);
		this.addChild(this.levelDescr2, 1);
	}

	draw(renderer, viewport) {
		renderer.setGlobalAlpha(0.3);
		renderer.setColor("#008800");
		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor("#000000");
		renderer.stroke(this.divider);
		renderer.stroke(this.border);
		renderer.setColor("#ffffff");
		renderer.fill(this.divider);
		super.draw(renderer, viewport);
	}
}
class GameOverBack extends Container {
	constructor(theGame) {
		super();
		this.theGame = theGame;
		this.players = GameOverBack.playersFromGame(theGame);
		this.isGameOver = true;

		// where to position each box of statistics
		this.posArray   = [
			new Vector2d(60, 215),
			new Vector2d(280, game.viewport.height - 400),
			new Vector2d(500, 215),
			new Vector2d(720, game.viewport.height - 400)
		];

		for( let i = 0; i < this.players.length; i++ ) {
			if( this.players[i] !== null && this.players[i].hasWon ) {
				if( MultiplayerManager.get().multiplayerPlayer.id === this.players[i].id ) {

					// we are the winner
					this.isGameOver = false;
					break;
				}
			}
		}
		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		// give a name
		this.name = "TitleBack";

		this.sensaSprite = new Sprite(790, game.viewport.height - 300, {
			image: this.isGameOver ? "sensa_nee" : "sensa_jaa",
		});
		this.sensaSprite.setOpacity(0.6);
		this.addChild(this.sensaSprite, 1);
		this.addChild(new StateBackground(this.isGameOver ? "LOOOOOOSER!" : "CONGRATS! WINNER!", false, true, true), 0);

		for( let i = 0; i < this.players.length; i++ ) {
			if( this.players[i] !== null ) {
				this.addChild(
					new PlayerStatistics(
						this.posArray[i].x, 
						this.posArray[i].y, 
						210, 240,
						this.players[i], 
						PLAYER_COLORS[i]
					), 
					6
				);	
			}
		}
	}

	/**
	 * Returns an array of players for this game and calculates who has won
	 * 
	 * @param {*} theGame
	 * @returns array of player
	 */
	static playersFromGame(theGame) {
		let players = [];
		players[0] = theGame.player1 !== undefined ? theGame.player1 : null;
		players[1] = theGame.player2 !== undefined ? theGame.player2 : null;
		players[2] = theGame.player3 !== undefined ? theGame.player3 : null;
		players[3] = theGame.player4 !== undefined ? theGame.player4 : null;

		for( let i=0; i < players.length; i++ ) {
			if( players[i] !== null ) {
				let p = players[i];
				let score = p.score;
				score += p.energyLeft > 0 ? (p.energyLeft * 5) : 0;
				score += p.potionsLeft > 0 ? (p.potionsLeft * 5) : 0;
				score += p.bombsLeft > 0 ? (p.bombsLeft * 5) : 0;

				players[i].internalScore = score;
				players[i].hasWon = false;				
			}
		}

		let winner = null;
		let score  = 0;
		for( let i=0; i < players.length; i++ ) {
			if( players[i] !== null ) {
				if( players[i].energyLeft > 0 ) {
					if( players[i].internalScore > score) {
						score = players[i].internalScore;
						winner = players[i];
					}
				}
			}
		}

		if( winner !== null ) {
			winner.hasWon = true;
		}
		return players;
	}
}

export default class MultiplayerGameOverScreen extends Stage {
	constructor(isGameOver = true) {
		super();
		this.isGameOver = isGameOver;
	}

	/**
	 *  action to perform on state change
	 */
	onResetEvent() {
		console.log("GameOver.OnEnter()");

		if( MultiplayerManager.get().weAreHost ) {		
			console.log("We are host, so we are sending updated data to the host and finishing this game");	
			MultiplayerManager.get()
				.refreshGameData()
				.then((theGame) => {
				
				GameOverBack.playersFromGame(theGame);

				MultiplayerManager.get()
					.finishGame(theGame)
					.then((theGame) => {
						this.theGame = theGame;
						this.buildUI(theGame);
				});
			});
		}
		else {
			console.log("We are no host, so we are NOT sending updated data to the host and finishing this game");
			MultiplayerManager.get()
				.refreshGameData()
				.then((theGame) => {
					this.theGame = theGame;
					this.buildUI(theGame);		
			});
		}
	}

	buildUI(theGame) {
		this.back = new GameOverBack(theGame);
		game.world.addChild(this.back);

		this.emitter = new ParticleEmitter(game.viewport.width / 2, game.viewport.height / 2 + 100, {
			//image: loader.getImage("player"),
			tint: new Color(255, 0, 0),
			width: 64,
			height: 64,
			totalParticles: 30,
			gravity: 0.02,
			angle: 0,
			angleVariation: 6.283185307179586,
			speed: 2,
			wind: 0.25,
		});
		game.world.addChild(this.emitter);
		this.emitter.streamParticles();

		// change to play state on press Enter or click/tap
		input.bindKey(input.KEY.ENTER, "enter", true);
		input.bindPointer(input.pointer.LEFT, input.KEY.ENTER);

		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_GAME_OVER))
				return;
			console.log("GameOver.EventHandler()");
			if (action === "enter" || action === "bomb") {
				state.change(my_state.MULTIPLAYER_MENU);
			}
			if (action === "exit") {
				state.change(my_state.MULTIPLAYER_MENU);
			}
		});
	}

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent() {
		console.log("GameOver.OnExit()");
		input.unbindKey(input.KEY.ENTER);
		input.unbindPointer(input.pointer.LEFT);
		event.off(event.KEYUP, this.handler);
		game.world.removeChild(this.back);
		game.world.removeChild(this.emitter);
		GlobalGameState.reset();
		MultiplayerManager.get().closeActiveGame();
	}
}
