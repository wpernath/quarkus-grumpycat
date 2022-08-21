import { Renderable, BitmapText, game, event, Container, Text, Vector2d, Renderer, Color, Rect, RoundRect} from "melonjs/dist/melonjs.module.js";

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

class EnergyItem extends Container {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(x, y, 200, 32);

		this.energyText = new BitmapText(this.pos.x + 20, this.pos.y + 20, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "Energy:",
		});
				
		this.energy                 = 0;
		this.maxEnergy              = 0;
		this.energyBarWidth         = 180;
		this.energyBarMaxFillWidth  = this.energyBarWidth - 8;
		this.energyBarHeight        = 16;
		this.energyBarFillColor     = new Color(0, 255, 0);
		this.energyBarBoxColor      = new Color(10,10,10);
		this.energyBarBoxBorder     = new RoundRect(this.pos.x + 4, this.pos.y , this.energyBarWidth, this.energyBarHeight);
		this.energyBarBoxBackFill   = new Color(50,50,50);
		this.energyBarFillBox		= new Rect(this.pos.x + 8, this.pos.y + 2, this.energyBarMaxFillWidth, this.energyBarHeight - 4);

		this.lowEnergyColor			= new Color(255,255,0);
		this.criticalEnergyColor	= new Color(255, 0,0);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		if (this.energy != GlobalGameState.energy || this.energy != GlobalGameState.maxEnergy) {
			this.energy = GlobalGameState.energy;
			this.maxEnergy = GlobalGameState.maxEnergy;
			this.isDirty = true;
			return true;
		}
		return false;
	}

	draw(renderer) {
		// draw energy bar background
		renderer.setGlobalAlpha(0.5);
		renderer.setColor(this.energyBarBoxBackFill);
		renderer.fill(this.energyBarBoxBorder);

		renderer.setGlobalAlpha(1);
		renderer.setColor(this.energyBarBoxColor);
		renderer.stroke(this.energyBarBoxBorder);
		
		// draw energy bar foreground
		let fillPercent = this.energy / this.maxEnergy;
		let fillColor = this.energyBarFillColor;
		if( fillPercent < 0.15) fillColor = this.criticalEnergyColor;
		else if( fillPercent >0.15 && fillPercent < 0.51) fillColor = this.lowEnergyColor;
		renderer.setColor(fillColor);
		this.energyBarFillBox.width = Math.round(this.energyBarMaxFillWidth * fillPercent);
		renderer.fill(this.energyBarFillBox);

		// draw energy bar text
		renderer.setTint(this.energyText.tint, this.energyText.getOpacity());
		this.energyText.draw(renderer, this.energyText.text, this.energyText.pos.x, this.energyText.pos.y);
		super.draw(renderer);

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


/**
 * The HUDContainer contains information about the player:
 * - Energy
 * - Number of Bombs
 * - SCORE
 * - Different magic items (shield, fireball, bolt etc.)
 * - Pause message
 * - Message box (on multi player only)
 */
export default class HUDContainer extends Container {
	constructor(options) {
		super(0, 0, game.viewport.width, GlobalGameState.isMultiplayerMatch ? 96 : 36);

		this.backColor = new Color(50, 50, 50);
		this.boxColor = new Color(10, 10, 10);
		this.backBox = new Rect(this.pos.x + 1, this.pos.y, game.viewport.width - 2, this.height);

		// persistent across level change
		this.isPersistent = true;

		// make sure we use screen coordinates
		this.floating = true;

		// make sure this container will be rendererd on pause
		this.updateWhenPaused = false;

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
		this.addChild(new EnergyItem(5, 20));
		this.addChild(new BombItem(0, 5));

		//if( GlobalGameState.isMultiplayerMatch ) {
		//this.addChild(new MultiplayerMessageCenter(0,50, game.viewport.width, 26));
		//}

		this.addChild(this.pauseText);
		this.pauseText.setText("");
	}

	draw(renderer) {
		renderer.setGlobalAlpha(0.3);
		renderer.setColor(this.backColor);
		renderer.fill(this.backBox);

		renderer.setGlobalAlpha(1.0);
		renderer.setColor(this.boxColor);
		renderer.stroke(this.backBox);
		//renderer.setTint(this.textBox.tint, this.textBox.getOpacity());
		//this.textBox.draw(renderer, this.currentMessage, this.textBox.pos.x, this.textBox.pos.y);
		super.draw(renderer);
	}

	setPaused(paused, text = "") {
		if (!paused) {
			this.pauseText.setText("");
		} else {
			this.pauseText.setText(text);
			let width = this.pauseText.measureText(text).width;
			this.pauseText.pos.x = (game.viewport.width - width) / 2;
		}
	}
}
