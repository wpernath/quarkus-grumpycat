import { game, input, state } from 'melonjs/dist/melonjs.module.js';
import BombEntity from './bomb';
import ExplosionEntity from './explosion';
import GlobalGameState from '../util/global-game-state';
import { LevelManager } from '../util/level';

import { GameStateAction } from "../util/game-updates";
import { BONUS_TILE, BasePlayerSprite, BARRIER_TILE } from './base-player';
import NetworkManager from '../util/network';

class PlayerEntity extends BasePlayerSprite {
	levelOver = false;

	/**
	 * constructor
	 */
	constructor(x, y, justImage = false) {
		// call the parent constructor
		super(x, y, justImage);

		// set the display to follow our position on both axis
		if (!justImage) {
			game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.1);
		}
	}

	destroy() {
		this.tint = undefined;
		super.destroy();
	}

	/**
	 * update the entity
	 */
	update(dt) {
		if (this.justImage) return true;

		let mapX = Math.floor(this.pos.x / 32);
		let mapY = Math.floor(this.pos.y / 32);
		let dx = 0,
			dy = 0;

		// this is the data to be stored on the server
		let action = new GameStateAction();

		if (this.levelOver) return super.update(dt);
		action.x = mapX;
		action.y = mapY;

		if (input.isKeyPressed("barrier")) {
			if (input.isKeyPressed("left")) {
				dx = -1;
			} else if (input.isKeyPressed("right")) {
				dx = +1;
			}
			if (input.isKeyPressed("up")) {
				dy = -1;
			} else if (input.isKeyPressed("down")) {
				dy = +1;
			}

			this.oldDx = dx;
			this.oldDy = dy;
			if (dx != 0 || dy != 0) {
				// place a new barrier tile in borderLayer
				// only if there is no border tile at that pos
				let bX = mapX + dx;
				let bY = mapY + dy;
				if (this.placeBorderTile(bX, bY)) {
					action.dx = dx;
					action.dy = dy;
					action.gutterThrown = true;
					action.hasChanged = true;
					NetworkManager.getInstance().writePlayerAction(action);
				}
			}
		} 
        else if( input.isKeyPressed("magic")) {            
			if (input.isKeyPressed("left")) {
				dx = -1;
			} 
            else if (input.isKeyPressed("right")) {
				dx = +1;
			}
			if (input.isKeyPressed("up")) {
				dy = -1;
			} 
            else if (input.isKeyPressed("down")) {
				dy = +1;
			}

			this.oldDx = dx;
			this.oldDy = dy;
			if (dx != 0 || dy != 0) {
				// place a new barrier tile in borderLayer
				// only if there is no border tile at that pos
				let bX = mapX + dx;
				let bY = mapY + dy;
                
                if( this.spell == null && this.throwMagicFireSpin(mapX, mapY)) {
				//if ( this.spell == null && this.throwMagicSpell(bX, bY, dx, dy)) {
                    console.log("MAGIC!!!!!");
                    /*
					action.dx = dx;
					action.dy = dy;
					action.gutterThrown = true;
					action.hasChanged = true;
					NetworkManager.getInstance().writePlayerAction(action);
                    */
				}
			}
        }
        else {
			if (input.isKeyPressed("bomb")) {
				if (GlobalGameState.bombs > 0) {
					game.world.addChild(new BombEntity(this.pos.x, this.pos.y));
					GlobalGameState.usedBombs++;
					GlobalGameState.bombs--;
					action.bombPlaced = true;
					action.dx = dx;
					action.dy = dy;
					action.hasChanged = true;
					NetworkManager.getInstance().writePlayerAction(action);
					return super.update(dt);
				}
			}
			if (input.isKeyPressed("explode")) {
				game.world.addChild(new ExplosionEntity(this.pos.x, this.pos.y));
			}

			if (input.isKeyPressed("left")) {
				this.flipX(true);
				dx = -(dt * this.VELOCITY);
				if (this.oldDx >= 0) {
					//this.setCurrentAnimation("walk-left");
					this.oldDx = dx;
				}
			} else if (input.isKeyPressed("right")) {
				this.flipX(false);
				dx = dt * this.VELOCITY;
				if (this.oldDx <= 0) {
					this.oldDx = dx;
					//    this.setCurrentAnimation("walk-right");
				}
			}
			if (input.isKeyPressed("up")) {
				dy = -(dt * this.VELOCITY);
				if (this.oldDy >= 0) {
					//    this.setCurrentAnimation("walk-up");
					this.oldDy = dy;
				}
			} else if (input.isKeyPressed("down")) {
				dy = dt * this.VELOCITY;
				if (this.oldDy <= 0) {
					//    this.setCurrentAnimation("walk-down");
					this.oldDy = dy;
				}
			}

			if ((dx != 0 || dy != 0) && this.updateWalkable(action, dx, dy)) {
				this.checkBonusTile(this.pos.x, this.pos.y);
				if (this.collectedBonusTiles >= this.numberOfBonusTiles) {
					// level done, check to see if there are more levels
					action.gameWon = true;
					this.levelOver = true;
					NetworkManager.getInstance().writePlayerAction(action);
					if (LevelManager.getInstance().hasNext()) {
						LevelManager.getInstance().next();
						state.change(state.READY);
					} else {
						state.change(state.GAME_END);
					}
				}

				mapX = Math.floor(this.pos.x / 32);
				mapY = Math.floor(this.pos.y / 32);

				if (mapX != this.lastMapX || mapY != this.lastMapY || action.gameWon || action.gameOver) {
					action.x = mapX;
					action.y = mapY;
					this.lastMapX = mapX;
					this.lastMapY = mapY;
					action.hasChanged = true;
					NetworkManager.getInstance().writePlayerAction(action);
				}
			}
		}

		if (GlobalGameState.energy <= 0) {
			console.log("GAME OVER!");
			GlobalGameState.isGameOver = true;
			this.levelOver = true;
			state.change(state.GAMEOVER);
			action.gameOver = true;
			action.hasChanged = true;
			NetworkManager.getInstance().writePlayerAction(action);
		}

		// call the parent method
		return super.update(dt);
	}
};

export default PlayerEntity;
