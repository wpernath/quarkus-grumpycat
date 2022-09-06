import { Container, BitmapText, game,loader, Stage, input,event, state, ParticleEmitter } from "melonjs/dist/melonjs.module.js";
import { LevelManager } from "../util/level";
import NetworkManager from "../util/network";
import { my_state } from "../util/constants";
import { StateBackground } from "./state_background";
import { BaseContainer } from "../util/base-container";


class LevelDescription extends BaseContainer {
	constructor(x,y,width,height) {
		super(x,y,width,height, {
			titleText: LevelManager.getInstance().getCurrentLevel().longName,
			titleColor: "#ffa000"
		});		

		this.levelDescr = new BitmapText(this.contentContainer.pos.x,this.contentContainer.pos.y, {
			font: "18Outline",
			lineHeight: 1.5,
			fillStyle: "white",
			textAlign: "left",
			wordWrapWidth: this.contentContainer.width,
			text: LevelManager.getInstance().getCurrentLevel().description,
		});
		this.addChild(this.levelDescr);
	}
}

class GetReadyBack extends Container {
	constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleBack";

		this.addChild(new StateBackground("GET READY"));

		let w = 644;
		let h = 300;
		let x = (game.viewport.width - w)/2;
		let y = (game.viewport.height - 350);
		this.addChild(new LevelDescription(x, y, w, h));
	}	
}

export default class GetReadyScreen extends Stage {

	/**
	 *  action to perform on state change
	 */
	onResetEvent() {		
		console.log("GetReady.OnEnter()");
 
		this.back = new GetReadyBack();
		game.world.addChild(this.back);

		this.emitter = new ParticleEmitter(game.viewport.width/2, game.viewport.height / 2-30, {			
			image: loader.getImage("player"),
			//tint: "#1010ff",
			width: 32,
			height: 32,
			totalParticles: 30,
			gravity: 0.03,
			angle: 0,
            angleVariation: 6.283185307179586,			
			speed: 3,
			//wind: -1,
		} );
		game.world.addChild(this.emitter);
		this.emitter.streamParticles();

		// change to play state on press Enter or click/tap
		input.bindKey(input.KEY.ENTER, "enter", true);
		input.bindPointer(input.pointer.LEFT, input.KEY.ENTER);

		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(state.READY)) return;
			console.log("GetReady.EventHandler()");
			if (action === "enter" || action === "bomb") {

				NetworkManager.getInstance().createGameOnServer()
				.then(function() {
					state.change(state.PLAY);
					input.unbindKey(input.KEY.ENTER);
					input.unbindPointer(input.pointer.LEFT);
				})
				.catch(function(err) {
					console.error("Error creating new game on server: " + err);
					state.change(state.MENU);
				});				
			}
			if (action === "exit") {
				state.change(my_state.SINGLE_PLAYER_MENU);
			}
		});
	}

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent() {
		console.log("GetReady.OnExit()");
		input.unbindKey(input.KEY.ENTER);
		input.unbindPointer(input.pointer.LEFT);
		event.off(event.KEYUP, this.handler);
		game.world.removeChild(this.back);
		game.world.removeChild(this.emitter);
	}
}
