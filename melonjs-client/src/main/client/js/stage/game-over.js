import { Stage, game, input, Sprite, loader, event, state, Container,Vector2d,BitmapText, ParticleEmitter } from "melonjs/dist/melonjs.module.js";
import { LevelManager } from "../util/level";
import GlobalGameState from "../util/global-game-state";
import NetworkManager from "../util/network";
import { StateBackground } from "./state_background";
import { BaseContainer } from "../util/base-container";
class LevelStatistics extends BaseContainer {
	constructor(x, y, width, height, isGameOver=true) {
		super(x, y, width, height, {
			titleText: GlobalGameState.globalServerGame.player.name + " - Statistics",
			titleColor: "#ffffff",			
		});


		let textL = 
			"Score: \n" +
			"Level: "  + "\n" +
			"Bonus collected: "  + "\n" +
			"Chests opened: " + "\n" +
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
			GlobalGameState.collectedChests + "\n" + 
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

		this.levelDescr = new BitmapText(14, this.contentContainer.pos.y, {
			font: "18Outline",
			textAlign: "left",
			text: textL,
		});

		this.levelDescr2 = new BitmapText(324, this.contentContainer.pos.y, {
			font: "18Outline",
			textAlign: "right",
			text: textR,
		});

		this.addChild(this.levelDescr,1);
		this.addChild(this.levelDescr2,1);		
	}
}
class GameOverBack extends Container {
	constructor(isGameOver=true) {
		super(0, 0);

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		// give a name
		this.name = "TitleBack";

		// dog NOOOOOOOO 
		this.sensaSprite = new Sprite(600, game.viewport.height - 300, {
			image: loader.getImage(isGameOver ? "sensa_nee" : "sensa_jaa"),
			anchorPoint: new Vector2d(0,0),
		});
		this.sensaSprite.setOpacity(0.8);

		let w = 460;
		let h = 300;
		let x = (game.viewport.width - w) / 2;
		let y = game.viewport.height - 350;

		this.addChild(new StateBackground(isGameOver ? "You LOOOOOSE!" : "CONGRATS! You won!", false), 0);
		this.addChild(
			new LevelStatistics(
				x, 
				y, 
				w, 
				h, 
				isGameOver
			), 
			6
		);

		this.sensaSprite.pos.x = game.viewport.width - this.sensaSprite.width + 50;
		this.sensaSprite.pos.y = game.viewport.height - this.sensaSprite.height ;
		this.addChild(this.sensaSprite, 1);		
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

		this.emitter = new ParticleEmitter(game.viewport.width / 2, game.viewport.height / 2 - 50, {
			image: loader.getImage("cat_left"),
			tint: "#ffffff33",
			width: 32,
			height: 32,
			totalParticles: 34,
			gravity: 0.04,
			angle: 0,
			angleVariation: 6.283185307179586,
			speed: 2,
			wind: 0.15,
		});
		game.world.addChild(this.emitter);
		this.emitter.streamParticles();

		NetworkManager.getInstance().writeHighscore().then( () => {
			// change to play state on press Enter or click/tap
			input.bindKey(input.KEY.ENTER, "enter", true);
			input.bindPointer(input.pointer.LEFT, input.KEY.ENTER);

			this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
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
		event.off(event.KEYUP, this.handler);
		game.world.removeChild(this.back);
		game.world.removeChild(this.emitter);
	}
}

