import { Renderable, BitmapText, game, event, Container, Text, Vector2d, Renderer, Color, Rect} from "melonjs/dist/melonjs.module.js";

import GlobalGameState from "../../util/global-game-state";


class ScoreItem extends BitmapText {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(game.viewport.width + x, y, {
			font: "24Outline",
			textAlign: "left",
			lineWidth: 2,
			textBaseline: "top",
			text: "Score: 999999",
		});

		
	
		this.relative = new Vector2d(x, y);
		this.score = -1;
		this.width = -1;

		event.on(
			event.CANVAS_ONRESIZE,
			function (w, h) {
				this.pos.set(w, h, 0).add(this.relative);
			}.bind(this)
		);
	}

	draw(renderer) {
		if( this.width === -1) {
			console.log("draw(renderer) called");
			this.width = this.measureText(renderer).width;
			this.pos.x = game.viewport.width - this.width + this.relative.x;
		}
		super.draw(renderer);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		if (this.score != GlobalGameState.score) {
			this.score = GlobalGameState.score;
			this.isDirty = true;
			this.setText("Score: " + this.score.toString().padStart(6, "0"));
			return true;
		}
		return false;
	}

}

class EnergyItem extends BitmapText {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(x, y, {
			font: "24Outline",
			textAlign: "left",
			lineWidth: 2,
			textBaseline: "top",
			text: "Energy: 999",
		});

		
		this.relative = new Vector2d(x, y);
		this.energy = -1;
		event.on(
			event.CANVAS_ONRESIZE,
			function (w, h) {
				this.pos.set(w, h, 0).add(this.relative);
			}.bind(this)
		);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		if (this.energy != GlobalGameState.energy) {
			this.energy = GlobalGameState.energy;
			this.isDirty = true;
			this.setText("Energy: " + this.energy);
			return true;
		}
		return false;
	}
}

class BombItem extends BitmapText {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(game.viewport.width / 2 + x, y, {
			font: "24Outline",
			textAlign: "left",
			lineWidth: 2,
			textBaseline: "top",
			text: "Bombs: 999",
		});
		
		this.relative = new Vector2d(x, y);
		this.bombs = -1;
		this.width = -1;

		event.on(
			event.CANVAS_ONRESIZE,
			function (w, h) {
				this.pos.set(w, h, 0).add(this.relative);
			}.bind(this)
		);
	}

	draw(renderer) {
		if (this.width === -1) {
			this.width = this.measureText(renderer).width;
			this.pos.x = ((game.viewport.width - this.width)/2) + this.relative.x;
		}
		super.draw(renderer);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		if (this.bombs != GlobalGameState.bombs) {
			this.bombs = GlobalGameState.bombs;
			this.isDirty = true;
			this.setText("Bombs: " + this.bombs.toString().padStart(3, "0"));
			return true;
		}
		return false;
	}
}

class MultiplayerMessageCenter extends Container {
	constructor(x,y,w,h) {
		super(x,y,w,h);

		this.currentMessage = "Test message: Hallo, echo!";
		this.backColor = new Color(50,50,50);
		this.boxColor  = new Color(10,10,10);
		this.backBox   = new Rect(this.pos.x + 2, this.pos.y, w-4, h);

		this.textBox   = new BitmapText(this.pos.x + 4, this.pos.y + 4, {
			font: "12Outline",
			textBaseline: "bottom"
		});

		this.gradient = null;
	}

	draw(renderer) {
		/*
		if( this.gradient == null ) {
			this.ctx = renderer.getContext("2d");
			this.gradient = this.ctx.createLinearGradient(0,0, 240,0);
			this.gradient.addColorStop(0, 'red');
			this.gradient.addColorStop(.5, "yellow");
			this.gradient.addColorStop(1, "green");
		}
		renderer.fillStyle = this.gradient;
		*/

		renderer.setGlobalAlpha(0.3);
		renderer.setColor(this.backColor);
		renderer.fill(this.backBox);

		renderer.setGlobalAlpha(1.0);
		renderer.setColor(this.boxColor);
		renderer.stroke(this.backBox);
		renderer.setTint(this.textBox.tint, this.textBox.getOpacity());
		this.textBox.draw(renderer, this.currentMessage, this.textBox.pos.x, this.textBox.pos.y);
		super.draw(renderer);
	}
}


export default class HUDContainer extends Container {
	constructor() {
		super(0, 0, game.viewport.width, game.viewport.height);

		// persistent across level change
		this.isPersistent = true;

		// make sure we use screen coordinates
		this.floating = true;

		// make sure this container will be rendererd on pause
		this.updateWhenPaused = true;

		// always on toppest
		this.z = 100;

		this.setOpacity(1.0);

		// give a name
		this.name = "HUD";

		// create a global PAUSE
		this.pauseText = new BitmapText(5, (game.viewport.height - 40) / 2, {
			font: "Shadow",			
			textAlign: "left",
			text: "*** P A U S E ***",
		});
		this.pauseText.updateWhenPaused = true;

		// add our child score object at the top left corner
		this.addChild(new ScoreItem(-5, 5));
		this.addChild(new EnergyItem(5, 5));
		this.addChild(new BombItem(0,5));

		//if( GlobalGameState.isMultiplayerMatch ) {
			//this.addChild(new MultiplayerMessageCenter(0,50, game.viewport.width, 26));
		//}

		this.addChild(this.pauseText);
		this.pauseText.setText("");
	}

	setPaused(paused, text = "") {
		if( !paused ) {			
			this.pauseText.setText("");
		}
		else {
			this.pauseText.setText(text);
			let width = this.pauseText.measureText(text).width;			
			this.pauseText.pos.x = (game.viewport.width - width ) / 2;
		}
	}

	
}
