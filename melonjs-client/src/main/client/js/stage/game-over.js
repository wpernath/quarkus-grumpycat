import { Stage, game, input, Sprite, Color, loader, event, state, Container,Vector2d,BitmapText, ParticleEmitter } from "melonjs/dist/melonjs.module.js";
import { LevelManager } from "../util/level";
import GlobalGameState from "../util/global-game-state";
import NetworkManager from "../util/network";
class LevelStatistics extends Container {
	constructor(x, y, width, height, isGameOver=true) {
		super(x, y, width, height);
		this.setOpacity(1);
		this.levelName = new BitmapText(14, 8, {
			font: "24Outline",
			size: "1",
			textAlign: "left",
			text: GlobalGameState.globalServerGame.player.name + " - Statistics",
		});


		let textL = 
			"Score: \n" +
			"Level: "  + "\n" +
			"Bonus collected: "  + "\n" +
			"Bombs left: " +  "\n" +
			"Used bombs: " +  "\n" +
			"Placed barriers: " + "\n"+
			"Bitten by spiders: " + "\n"+
			"Catched by cats: " + "\n"+
			"Catched by golems: " + "\n"+
			"Killed spiders: " + "\n"+
			"Stunned cats: " +  "\n"+
			"Stunned golems: " + "\n"+
 			"";

		let textR = 
			GlobalGameState.score + "\n" +
			(LevelManager.getInstance().getCurrentLevelIndex() + 1) + "\n" +
			GlobalGameState.bonusCollected + "\n" +
			GlobalGameState.bombs + "\n" +
			GlobalGameState.usedBombs + "\n" +
			GlobalGameState.placedBarriers + "\n"+
			GlobalGameState.bittenBySpiders + "\n"+
			GlobalGameState.catchedByCats + "\n"+
			GlobalGameState.catchedByGolems + "\n"+
			GlobalGameState.killedSpiders + "\n"+
			GlobalGameState.stunnedCats + "\n"+
			GlobalGameState.stunnedGolems + "\n"+
 			"";

		this.levelDescr = new BitmapText(14, 40, {
			font: "18Outline",
			textAlign: "left",
			text: textL,
		});

		this.levelDescr2 = new BitmapText(324, 40, {
			font: "18Outline",
			textAlign: "right",
			text: textR,
		});

		this.sensaSprite = new Sprite(600, 50, {
			image: isGameOver ? "sensa_nee" : "sensa_jaa"
		});
		this.sensaSprite.setOpacity(0.8);

		this.addChild(this.levelName,1);
		this.addChild(this.levelDescr,1);
		this.addChild(this.levelDescr2,1);
		this.addChild(this.sensaSprite,0);
	}
}
class GameOverBack extends Container {
	constructor(isGameOver=true) {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleBack";

		// a tween to animate the text
		// new sprite for the title screen, position at the center of the game viewport
		this.backgroundImage = new Sprite(game.viewport.width / 2, game.viewport.height / 2, {
			image: loader.getImage("sensa_grass"),
		});

		// scale to fit with the viewport size
		this.backgroundImage.scale(game.viewport.width / this.backgroundImage.width, game.viewport.height / this.backgroundImage.height);
		this.backgroundImage.setOpacity(0.3);

		this.catLeftImage = new Sprite(5, game.viewport.height - 300, {
			image: loader.getImage("grumpy_cat_right"),
			anchorPoint: new Vector2d(0, 0),
		});
		this.catRightImage = new Sprite(game.viewport.width - 180, game.viewport.height - 300, {
			image: loader.getImage("grumpy_cat_left"),
			anchorPoint: new Vector2d(0, 0),
		});

		this.titleText = new Sprite(86, 0, {
			image: loader.getImage("title"),
			anchorPoint: new Vector2d(0, 0),
		});

		this.subTitleText = new BitmapText(126, 170, {
			font: "Shadow",
			size: "1",
			fillStyle: "white",
			textAlign: "left",
			text: isGameOver ? "GAME OVER!" : "CONGRATS! You won!",			
		});

		// add to the world container
		this.addChild(this.backgroundImage, 0);
		this.addChild(this.catLeftImage, 5);
		//this.addChild(this.catRightImage, 7);
		this.addChild(this.titleText, 100);
		this.addChild(this.subTitleText, 100);
		this.addChild(
			new LevelStatistics(
				190, 
				game.viewport.height - 400, 
				game.viewport.width - 400, 
				game.viewport.height - 400, 
				isGameOver
			), 
			6
		);
	}
}

export default class GameOverScreen extends Stage {
	constructor(isGameOver = true) {
		super();
		this.isGameOver = isGameOver;
	}

	/**
	 *  action to perform on state change
	 */
	onResetEvent() {
		console.log("GameOver.OnEnter()");

		this.back = new GameOverBack(this.isGameOver);
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

		NetworkManager.getInstance().writeHighscore().then( () => {
			// change to play state on press Enter or click/tap
			input.bindKey(input.KEY.ENTER, "enter", true);
			input.bindPointer(input.pointer.LEFT, input.KEY.ENTER);

			this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
				if (!state.isCurrent(state.GAMEOVER)) return;
				console.log("GameOver.EventHandler()");
				if (action === "enter" || action === "bomb") {
					state.change(state.SCORE);
				}
				if (action === "exit") {
					state.change(state.MENU);
				}
			});
		});
	}

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent() {
		console.log("GameOver.OnExit()");
		input.unbindKey(input.KEY.ENTER);
		input.unbindPointer(input.pointer.LEFT);
		event.off(event.KEYDOWN, this.handler);
		game.world.removeChild(this.back);
		game.world.removeChild(this.emitter);
	}
}

