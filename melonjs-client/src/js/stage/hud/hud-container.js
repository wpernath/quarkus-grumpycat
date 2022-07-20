import { Renderable, BitmapText, game, event, Container, Text, Vector2d, Renderer} from "melonjs/dist/melonjs.module.js";

import GlobalGameState from "../../util/global-game-state";

const FONT_SIZE = 1;

class ScoreItem extends BitmapText {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(game.viewport.width + x, y, {
			font: "Shadow",
			size: FONT_SIZE,
			fillStyle: "white",
			strokeStyle: "black",
			textAlign: "left",
			lineWidth: 2,
			textBaseline: "top",
			text: "Score: 999999",
			offScreenCanvas: false		 // this has impact on positioning
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
			font: "Shadow",
			size: FONT_SIZE,
			fillStyle: "white",
			strokeStyle: "black",
			textAlign: "left",
			lineWidth: 2,
			textBaseline: "top",
			text: "Energy: 999",
			offScreenCanvas: false, // this has impact on positioning
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
			font: "Shadow",
			size: FONT_SIZE,
			fillStyle: "white",
			strokeStyle: "black",
			textAlign: "left",
			lineWidth: 2,
			textBaseline: "top",
			text: "Bombs: 999",
			offScreenCanvas: false, // this has impact on positioning
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

export default class HUDContainer extends Container {
	constructor() {
		super();

		// persistent across level change
		this.isPersistent = true;

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 100;

		this.setOpacity(0.8);

		// give a name
		this.name = "HUD";

		// add our child score object at the top left corner
		this.addChild(new ScoreItem(-5, 5));
		this.addChild(new EnergyItem(5, 5));
		this.addChild(new BombItem(0,5));
	}
}
