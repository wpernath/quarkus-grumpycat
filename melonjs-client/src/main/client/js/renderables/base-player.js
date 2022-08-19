import { game, input, Sprite, Body, collision, level, Tile, Rect, state } from "melonjs/dist/melonjs.module.js";
import BombEntity from "./bomb";
import ExplosionEntity from "./explosion";
import GlobalGameState from "../util/global-game-state";
import { ENEMY_TYPES } from "./base-enemy";
import MagicBolt from "./magic-bolt";

export const BARRIER_TILE = {
	light: 182,
	mid: 183,
	dark: 184,
};

export const BONUS_TILE = {
	bomb: 961,
	star: 962,
	cactus: 963,
	meat: 966,
	cheese: 967,
};

export class BasePlayerSprite extends Sprite {

	VELOCITY = 0.3;
	
	borderLayer;
	bonusLayer;
	groundLayer;
	xInMap;
	yInMap;

	mapWidth;
	mapHeight;
	collectedBonusTiles = 0;
	numberOfBonusTiles = 0;
	oldDx = 0;
	oldDy = 0;

	lastMapX = 0;
	lastMapY = 0;

	justImage = false;

	constructor(x, y, justImage = false) {
		let settings = {
			width: 32,
			height: 32,
			framewidth: 32,
			frameheight: 32,
			image: "player", //image: "animals-walk"
		};
		super(x * 32 + 16, y * 32 + 16, settings);
		this.justImage = justImage;
		this.xInMap = x;
		this.yInMap = y;
		this.lastMapX = x;
		this.lastMapY = y;
		this.spell = null; // only one spell at a time

		if( !this.justImage ) {
			this.body = new Body(this);
			this.body.ignoreGravity = true;
			this.body.addShape(new Rect(0, 0, this.width, this.height));
			this.body.collisionType = collision.types.PLAYER_OBJECT;
			this.body.setCollisionMask(collision.types.ENEMY_OBJECT);
	
			// ensure the player is updated even when outside of the viewport
			this.alwaysUpdate = true;
			this.mapHeight = level.getCurrentLevel().rows;
			this.mapWidth = level.getCurrentLevel().cols;

			let layers = level.getCurrentLevel().getLayers();
			layers.forEach((l) => {
				if (l.name === "Bonus") this.bonusLayer = l;
				else if (l.name === "Frame") this.borderLayer = l;
				else if (l.name === "Ground") this.groundLayer = l;
			});

			for (let x = 0; x < this.mapWidth; x++) {
				for (let y = 0; y < this.mapHeight; y++) {
					let tile = this.bonusLayer.cellAt(x, y);
					if (tile !== null) this.numberOfBonusTiles++;
				}
			}
		}
	}

	isWalkable(x, y) {
		let realX = Math.floor(x / 32);
		let realY = Math.floor(y / 32);

		if( realX < 0 || realY < 0 || realX > this.mapWidth || realY > this.mapHeight ){
			return false;
		}
		let tile = this.borderLayer.cellAt(realX, realY);
		if (tile !== null && tile != undefined ) return false;
		else return true;
	}

	updateWalkable(action, dx,dy) {
		let pos = this.pos;
		if( this.isWalkable(pos.x + dx, pos.y + dy)) {
			this.pos.x += dx;
			this.pos.y += dy;

			action.dx = dx;
			action.dy = dy;
			return true;
		}
		if( this.isWalkable(pos.x + dx, pos.y)) {
			this.pos.x += dx;			
			action.dx = dx;
			action.dy = 0;
			return true;
		}
		if( this.isWalkable(pos.x, pos.y + dy)) {
			this.pos.y += dy;
			action.dx = 0;
			action.dy = dy;
			return true;
		}
		return false;
	}

	_collectBonusTile(x, y) {
		let realX = Math.floor(x / 32);
		let realY = Math.floor(y / 32);
		let tile = this.bonusLayer.cellAt(realX, realY);
		if (tile !== null && tile != undefined) {
			this.bonusLayer.clearTile(realX, realY);
			return tile.tileId;
		}
		return 0;
	}

	checkBonusTile(x,y, update = true) {
		let bonus = this._collectBonusTile(this.pos.x, this.pos.y);
		if( bonus !== 0 ) {
			this.collectedBonusTiles++;
			if( update ) {
				GlobalGameState.bonusCollected++;
				if( bonus === BONUS_TILE.bomb ) { // bomb                        
					GlobalGameState.bombs += GlobalGameState.bombsForBombBonus;
					GlobalGameState.score += GlobalGameState.scoreForBombs;
				}
				else if( bonus === BONUS_TILE.star) { // super power
					GlobalGameState.score += GlobalGameState.scoreForStars;
					GlobalGameState.hasSuperPower = true;
					GlobalGameState.numberOfSuperPowers += GlobalGameState.superPowersForStarBonus;
				}
				else if( bonus === BONUS_TILE.cactus) { // cactus
					GlobalGameState.score += GlobalGameState.scoreForPills;
				}
				else if( bonus === BONUS_TILE.meat) { // meat
					GlobalGameState.energy+= GlobalGameState.energyForMeat;
					GlobalGameState.score += GlobalGameState.scoreForMeat;
				}
				else if( bonus === BONUS_TILE.cheese) { // cheese
					GlobalGameState.energy+= GlobalGameState.energyForCheese;
					GlobalGameState.score += GlobalGameState.scoreForCheese;
				}
			}
		}
		return bonus;
	}

	throwMagicSpell(bX, bY, dx, dy, update = true) {
		if( this.spell !== null ) return false;
		if( this.borderLayer.cellAt(bX, bY) == null ) {
			this.spell = new MagicBolt(this, bX, bY, dx, dy);
			game.world.addChild(this.spell);
			return true;
		}
		return false;
	}
	placeBorderTile(bX, bY, update = true) {
		if( this.borderLayer.cellAt(bX, bY) == null ) {
			let newBorderId = 184;
			let ground = this.groundLayer.cellAt(bX,bY);
			if( ground !== null ) {
				let gId = ground.tileId;
	//                        switch(gId) {
	//                            case: 
	//                        }
			}
			let tile = this.borderLayer.getTileById(newBorderId, bX, bY);
			this.borderLayer.setTile(tile, bX, bY);
			if( update ) GlobalGameState.placedBarriers++;
			return true;
		}
		return false;
	}

	/**
	 * colision handler
	 * (called when colliding with other objects)
	 */
	onCollision(response, other) {
		if (GlobalGameState.invincible) return false;
		if (other.body.collisionType === collision.types.ENEMY_OBJECT && !other.isStunned && !other.isDead && !GlobalGameState.isGameOver) {
			if (other.enemyType === ENEMY_TYPES.cat) {
				GlobalGameState.catchedByCats++;
				GlobalGameState.energy -= GlobalGameState.energyLostByCat;
			} else if (other.enemyType === ENEMY_TYPES.spider) {
				GlobalGameState.bittenBySpiders++;
				GlobalGameState.energy -= GlobalGameState.energyLostBySpider;
			} else if (other.enemyType === ENEMY_TYPES.golem) {
				GlobalGameState.catchedByGolems++;
				GlobalGameState.energy -= GlobalGameState.energyLostByGolem;
			}

			GlobalGameState.invincible = true;
			this.flicker(GlobalGameState.playerInvincibleTime, () => {
				GlobalGameState.invincible = false;
			});
		}
		return false;
	}

}