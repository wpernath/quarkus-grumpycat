import { Renderable, BitmapText, game, event, Container, Vector2d, Color, Rect, RoundRect, Sprite} from "melonjs/dist/melonjs.module.js";
import BaseTerrainSprite from "../../renderables/terrain/terrain-sprite";

import GlobalGameState from "../../util/global-game-state";
import { BONUS_TILE, PLAYER_COLORS } from "../../util/constants";
import MultiplayerManager from "../../util/multiplayer";


class ScoreItem extends Container {
	/**
	 *
	 * @param x
	 * @param y
	 */
	constructor(x, y) {
		super(x, y, 160, 34);

		this.text = new BitmapText(0,0, {
			font: "Shadow",
			textBaseline: "top",
			text: "9999999",
		});

		// persistent across level change
		//this.isPersistent = true;

		// make sure we use screen coordinates
		this.floating = true;

		this.z = 100;

		this.score = -1;
		this.scoretext = "";

		event.on(
			event.CANVAS_ONRESIZE,
			function (w, h) {
				this.pos.set(w, h, 0);
			}.bind(this)
		);

		this.dogLeft = new Sprite(this.pos.x - 40, this.pos.y + 2, {
			image: "player",
			framewidth: 34,
			frameheight: 39,
			tint: PLAYER_COLORS[MultiplayerManager.get().getMultiplayerPlayerNumber()],
		});

		
		this.catRight = new Sprite(this.pos.x + 150, this.pos.y + 2, {
			image: "cat_left",
			framewidth: 40,
			frameheight: 39,
			flipX: true,
		});
		/*
		this.catRight = new Sprite(this.pos.x + 150, this.pos.y + 2, {
			image: "player",
			framewidth: 34,
			frameheight: 39,
			tint: PLAYER_COLORS[MultiplayerManager.get().getMultiplayerPlayerNumber()],
			flipX: true,
		});
		*/

	}

	draw(renderer) {	
//		console.log("ScoreItem.draw()")	;
		let width = this.text.measureText(renderer).width;		
		renderer.setTint(this.text.tint, this.text.getOpacity());
		this.text.draw(renderer, this.scoretext, 24 + (game.viewport.width - width) / 2, this.pos.y + 12);

		renderer.setTint(this.dogLeft.tint, this.dogLeft.getOpacity());
		this.dogLeft.draw(renderer);

		renderer.setTint(this.catRight.tint, this.catRight.getOpacity());

		this.catRight.draw(renderer);
		super.draw(renderer);
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
			this.scoretext = this.score.toString().padStart(7, "0");
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

	draw(renderer) {
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
		super.draw(renderer);

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
			
		this.textField = new BitmapText(0,0, {						
			font: "12Outline",
			textAlign: "left",
			textBaseline: "top",
			text: "99",
		});
		
		this.relative = new Vector2d(x, y);
		this.bombs = -1;
		this.magicBolts = -1;
		this.magicFirespins = -1;
		this.magicNebulas = -1;
		this.magicProtections = -1;
	
		this.bombImg = new BaseTerrainSprite(this.pos.x + 2, this.pos.y + 2, [BONUS_TILE.bomb0-1], true );
		this.boltImg = new BaseTerrainSprite(this.pos.x + 2 + 32, this.pos.y + 2, [BONUS_TILE.magicBolt - 1], true);
		this.fireImg = new BaseTerrainSprite(this.pos.x + 2 + 64, this.pos.y + 2, [BONUS_TILE.magicFirespin - 1], true);
		this.nebuImg = new BaseTerrainSprite(this.pos.x + 2 + 96, this.pos.y + 2, [BONUS_TILE.magicNebula - 1], true);
		this.protImg = new BaseTerrainSprite(this.pos.x + 2 + 128, this.pos.y + 2, [BONUS_TILE.magicProtectionCircle - 1], true);

		this.images = [];
		this.images.push(this.bombImg);
		this.images.push(this.boltImg);
		this.images.push(this.fireImg);
		this.images.push(this.nebuImg);
		this.images.push(this.protImg);

		event.on(
			event.CANVAS_ONRESIZE,
			function (w, h) {
				this.pos.set(w, h, 0).add(this.relative);
			}.bind(this)
		);
	}

	draw(renderer) {
		// draw those images
//		console.log("WeaponsItem.draw()");
		let x = this.pos.x + 2;
		let y = this.pos.y + 2;
		for( let i = 0; i < this.images.length; i++ ) {
			this.images[i].draw(renderer)
			renderer.drawImage(this.images[i].image, 
				this.images[i].offset.x + this.images[i].current.offset.x,
				this.images[i].offset.y + this.images[i].current.offset.y,
				32, 32,
				this.pos.x + 2 + (i * 32), 
				this.pos.y + 2,
				32, 32
			);
		}
		// draw texts
		renderer.setTint(this.textField.tint, this.textField.getOpacity());
		this.textField.draw(renderer, this.bombs.toString().padStart(2, '0'), this.pos.x + 10, this.pos.y + 30);
		this.textField.draw(renderer, this.magicBolts.toString().padStart(2, "0"), this.pos.x + 42, this.pos.y + 30);
		this.textField.draw(renderer, this.magicFirespins.toString().padStart(2, "0"), this.pos.x + 74, this.pos.y + 30);
		this.textField.draw(renderer, this.magicNebulas.toString().padStart(2, "0"), this.pos.x + 106, this.pos.y + 30);
		this.textField.draw(renderer, this.magicProtections.toString().padStart(2, "0"), this.pos.x + 138, this.pos.y + 30);
		super.draw(renderer);
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
			this.isDirty = true;				
		}

		if( this.magicBolts != GlobalGameState.magicBolts) {
			this.magicBolts = GlobalGameState.magicBolts;
			this.isDirty = true;				
		}

		if( this.magicFirespins != GlobalGameState.magicFirespins ) {
			this.magicFirespins = GlobalGameState.magicFirespins;
			this.isDirty = true;				
		}

		if( this.magicNebulas != GlobalGameState.magicNebulas ) {
			this.magicNebulas = GlobalGameState.magicNebulas;
			this.isDirty = true;				
		}

		if (this.magicProtections != GlobalGameState.magicProtections) {
			this.magicProtections = GlobalGameState.magicProtections;;
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
		//this.isPersistent = true;
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
		this.addChild(new ScoreItem((game.viewport.width - 160 ) /2, this.pos.y +1));
		this.addChild(new EnergyItem(5, this.pos.y + 1));
		this.addChild(new WeaponsItem(game.viewport.width - 170, this.pos.y + 1, 168, 34));

		//if( GlobalGameState.isMultiplayerMatch ) {
		//this.addChild(new MultiplayerMessageCenter(0,50, game.viewport.width, 26));
		//}

		this.addChild(this.pauseText);
		this.pauseText.setText("");
	}

	draw(renderer) {
		//console.log("HUD.draw()");
		renderer.setGlobalAlpha(0.5);
		renderer.setColor(this.backColor);
		renderer.fill(this.backBox);

		renderer.setGlobalAlpha(1.0);
		renderer.setColor(this.boxColor);
		super.draw(renderer);
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
