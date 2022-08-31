import { BitmapText, game, event, Container, Vector2d, Color, Rect, RoundRect } from "melonjs/dist/melonjs.module.js";
import BaseTerrainSprite from "../../renderables/terrain/terrain-sprite";

import GlobalGameState from "../../util/global-game-state";
import { BONUS_TILE, PLAYER_COLORS } from "../../util/constants";
import MultiplayerManager from "../../util/multiplayer";
import PlayerEntity from "../../renderables/player";

class ScoreItem extends Container {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(x, y, 240, 34);

		this.text = new BitmapText(0,0, {
			font: "Shadow",
			textBaseline: "top",
			
			text: "99999999",
		});

		// persistent across level change
		this.isPersistent = true;

		// make sure we use screen coordinates
		//this.floating = true;

		this.z = 100;

		this.score = -1;
		this.scoretext = "";

		event.on(
			event.CANVAS_ONRESIZE,
			function (w, h) {
				this.pos.set(w, h, 0);
			}.bind(this)
		);

		this.dogLeft = new PlayerEntity(0,  0, true);
		this.dogRight= new PlayerEntity(7, 0, true);
		this.dogLeft.tint.copy(PLAYER_COLORS[MultiplayerManager.get().getMultiplayerPlayerNumber()]);
		this.dogRight.tint.copy(PLAYER_COLORS[MultiplayerManager.get().getMultiplayerPlayerNumber()]);
		this.dogRight.flipX(true);

		this.addChild(this.dogLeft);
		this.addChild(this.dogRight);
		this.addChild(this.text);

		this.text.pos.x = (this.width - this.text.measureText().width) / 2;

	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		this.isDirty = false;
		super.update(dt);
		if (this.score != GlobalGameState.score) {
			this.score = GlobalGameState.score;
			this.isDirty = true;
			this.scoretext = this.score.toString().padStart(8, "0");
			this.text.setText(this.scoretext);
		}
		return this.isDirty;
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

		this.energyText = new BitmapText(0,0, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "Energy:",
		});
			
		this.energyPercent = new BitmapText(0, 0, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "100%",
		});

		this.energy                 = 0;
		this.maxEnergy              = 0;
		this.energyBarWidth         = 180;
		this.energyBarMaxFillWidth  = this.energyBarWidth - 10;
		this.energyBarHeight        = 17;
		this.energyBarBoxColor      = new Color(10,10,10);
		this.energyBarBoxBorder     = new RoundRect(4, 23 , this.energyBarWidth, this.energyBarHeight);
		this.energyBarBoxBackFill   = new Color(50,50,50);
		this.energyBarFillBox		= new Rect(10, 24, this.energyBarMaxFillWidth, this.energyBarHeight - 4);

		// energy bar colors
		this.energyBarFillColor 	= new Color(0, 255, 0);
		this.threeQuadEnergyColor	= new Color(100,255, 0);
		this.lowEnergyColor			= new Color(255,255,0);
		this.criticalEnergyColor	= new Color(255, 0,0);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		this.isDirty = false;
		super.update(dt);
		if (this.energy != GlobalGameState.energy || this.maxEnergy != GlobalGameState.maxEnergy) {
			this.energy = GlobalGameState.energy;
			this.maxEnergy = GlobalGameState.maxEnergy;
			this.isDirty = true;			
		}
		return this.isDirty;
	}

	draw(renderer, viewport) {
//		console.log("EnergyBar.draw()");
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
		if( fillPercent <= 0.3) fillColor = this.criticalEnergyColor;
		else if( fillPercent > 0.3 && fillPercent < 0.51) fillColor = this.lowEnergyColor;
		else if( fillPercent > 0.50 && fillPercent <= 0.75) fillColor = this.threeQuadEnergyColor;
		else fillColor = this.energyBarFillColor;

		renderer.setColor(fillColor);
		this.energyBarFillBox.width = Math.round(this.energyBarMaxFillWidth * fillPercent);
		renderer.fill(this.energyBarFillBox);

		// draw percent
		renderer.setTint(this.energyPercent.tint, this.energyPercent.getOpacity());
		this.energyPercent.draw(renderer, (Math.round(fillPercent * 100)) + " %", 90, 25);

		// draw energy bar text
		renderer.setTint(this.energyText.tint, this.energyText.getOpacity());
		this.energyText.draw(renderer, "Energy:", 6, 8);
		super.draw(renderer, viewport);

	}
}

class WeaponsItem extends Container {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y, w, h) {
		super(x,y, w, h);
			
		this.bombsText = new BitmapText(8,28, {						
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "99",
		});

		this.boltText = new BitmapText(40, 28, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "99",
		});

		this.fireText = new BitmapText(72, 28, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "99",
		});

		this.nebuText = new BitmapText(104, 28, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "99",
		});

		this.protText = new BitmapText(136, 28, {
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "99",
		});

		this.bombs = -1;
		this.magicBolts = -1;
		this.magicFirespins = -1;
		this.magicNebulas = -1;
		this.magicProtections = -1;
	
		this.bombImg = new BaseTerrainSprite(2,       2, [BONUS_TILE.bomb0-1], true );
		this.boltImg = new BaseTerrainSprite(2 + 32,  2, [BONUS_TILE.magicBolt - 1], true);
		this.fireImg = new BaseTerrainSprite(2 + 64,  2, [BONUS_TILE.magicFirespin - 1], true);
		this.nebuImg = new BaseTerrainSprite(2 + 96,  2, [BONUS_TILE.magicNebula - 1], true);
		this.protImg = new BaseTerrainSprite(2 + 128, 2, [BONUS_TILE.magicProtectionCircle - 1], true);

		this.addChild(this.bombImg);
		this.addChild(this.boltImg);
		this.addChild(this.fireImg);
		this.addChild(this.nebuImg);
		this.addChild(this.protImg);

		this.addChild(this.bombsText);
		this.addChild(this.boltText);
		this.addChild(this.fireText);
		this.addChild(this.nebuText);
		this.addChild(this.protText);
	}

	draw(renderer, viewport) {
		super.draw(renderer, viewport);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	update(dt) {
		this.isDirty = false;
		super.update(dt);
		if (this.bombs != GlobalGameState.bombs) {
			this.bombs = GlobalGameState.bombs;
			this.bombsText.setText(this.bombs.toString().padStart(2, "0"));
			this.isDirty = true;				
		}

		if( this.magicBolts != GlobalGameState.magicBolts) {
			this.magicBolts = GlobalGameState.magicBolts;
			this.boltText.setText(this.magicBolts.toString().padStart(2, "0"));
			this.isDirty = true;				
		}

		if( this.magicFirespins != GlobalGameState.magicFirespins ) {
			this.magicFirespins = GlobalGameState.magicFirespins;
			this.fireText.setText(this.magicFirespins.toString().padStart(2, "0"));
			this.isDirty = true;				
		}

		if( this.magicNebulas != GlobalGameState.magicNebulas ) {
			this.magicNebulas = GlobalGameState.magicNebulas;
			this.nebuText.setText(this.magicNebulas.toString().padStart(2, "0"));
			this.isDirty = true;				
		}

		if (this.magicProtections != GlobalGameState.magicProtections) {
			this.magicProtections = GlobalGameState.magicProtections;
			this.protText.setText(this.magicProtections.toString().padStart(2, "0"));
			this.isDirty = true;
		}

		return this.isDirty;
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
		super(0, 0, game.viewport.width, GlobalGameState.isMultiplayerMatch ? 62 : 48);

		this.backColor = new Color(50, 50, 50);
		this.boxColor = new Color(10, 10, 10);
		this.backBox = new Rect(this.pos.x + 1, this.pos.y, game.viewport.width - 2, this.height);

		// persistent across level change
		this.isPersistent = true;
		this.clipping = true;

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
		this.addChild(new ScoreItem((game.viewport.width - 240 ) /2, this.pos.y +1));
		this.addChild(new EnergyItem(5, this.pos.y + 1));
		this.addChild(new WeaponsItem(game.viewport.width - 170, this.pos.y + 1, 168, 34));

		//if( GlobalGameState.isMultiplayerMatch ) {
		//this.addChild(new MultiplayerMessageCenter(0,50, game.viewport.width, 26));
		//}

		this.addChild(this.pauseText);
		this.pauseText.setText("");
	}

	draw(renderer, viewport) {
		//console.log("HUD.draw()");
		renderer.setGlobalAlpha(0.5);
		renderer.setColor(this.backColor);
		renderer.fill(this.backBox);

		renderer.setGlobalAlpha(1.0);
		renderer.setColor(this.boxColor);
		super.draw(renderer, viewport);
	}

	setPaused(paused, text = "") {
		if (!paused) {
			this.pauseText.setText("");
			this.isDirty = true;
		} 
		else {
			this.pauseText.setText(text);
			let width = this.pauseText.measureText(text).width;
			this.pauseText.pos.x = (game.viewport.width - width) / 2;
			this.isDirty = true;
		}
	}
}
