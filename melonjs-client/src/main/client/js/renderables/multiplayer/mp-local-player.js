import { collision, game, input, state } from "melonjs/dist/melonjs.module.js";
import BombEntity from "../bomb";
import GlobalGameState from "../../util/global-game-state";

import { GameStateAction } from "../../util/game-updates";
import { BONUS_TILE, BasePlayerSprite, BARRIER_TILE } from "../base-player";

import MultiplayerManager from "../../util/multiplayer";
import { MultiplayerMessage } from "../../util/multiplayer";
import { my_collision_types } from "../../util/constants";
import { ENEMY_TYPES } from "../base-enemy";


export class MPLocalPlayerSprite extends BasePlayerSprite {
	levelOver = false;

	/**
	 * constructor
	 */
	constructor(x, y, player, color) {
		// call the parent constructor
		super(x, y, false);
		this.player = player;
		this.color = color;
		this.tint = color;

		// overwrite what type of collisions we want to see
		this.body.setCollisionMask(my_collision_types.REMOTE_BOMB | my_collision_types.REMOTE_PLAYER | collision.types.ENEMY_OBJECT);

		// set the display to follow our position on both axis
		game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.1);
	}

	/**
	 * update the entity
	 */
	update(dt) {
		let mapX = Math.floor(this.pos.x / 32);
		let mapY = Math.floor(this.pos.y / 32);
		let dx = 0,
			dy = 0;

		// this is the data to be stored on the server
		let action = MultiplayerMessage.gameUpdate();

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
					MultiplayerManager.get().sendAction(action);
				}
			}
		} else {
			if (input.isKeyPressed("bomb")) {
				if (GlobalGameState.bombs > 0) {
					let bomb = new BombEntity(this.pos.x, this.pos.y);
					bomb.tint = this.color;
					bomb.body.setCollisionMask(collision.types.ENEMY_OBJECT | my_collision_types.REMOTE_PLAYER);
					bomb.thrownByPlayer = this.player;
					game.world.addChild(bomb);
					GlobalGameState.usedBombs++;
					GlobalGameState.bombs--;
					action.bombPlaced = true;
					action.dx = dx;
					action.dy = dy;
					MultiplayerManager.get().sendAction(action);
					return super.update(dt);
				}
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
					action.levelOver = true;
					this.levelOver = true;
					MultiplayerManager.get().sendAction(action);
					MultiplayerManager.get().sendAction(MultiplayerMessage.gameOver());
				}

				mapX = Math.floor(this.pos.x / 32);
				mapY = Math.floor(this.pos.y / 32);

				if (mapX != this.lastMapX || mapY != this.lastMapY || action.gameWon || action.gameOver) {
					action.x = mapX;
					action.y = mapY;
					this.lastMapX = mapX;
					this.lastMapY = mapY;
					MultiplayerManager.get().sendAction(action);
				}
			}
		}

		if (GlobalGameState.energy <= 0) {
			console.log("GAME OVER!");
			GlobalGameState.isGameOver = true;
			this.levelOver = true;

			// TODO: implement
			action.levelOver = true;
			action.hasChanged = true;
			MultiplayerManager.get().sendAction(MultiplayerMessage.gameOver());
		}

		// call the parent method
		return super.update(dt);
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
		else if (other.body.collisionType === my_collision_types.REMOTE_BOMB) {
			if (other.isExploding) {
				// we got hit by an exploding bomb thrown by a remote player
				GlobalGameState.energy -= GlobalGameState.energyLostByRemoteBomb;
				GlobalGameState.hitByRemotePlayerBomb++;
				GlobalGameState.invincible = true;
				this.flicker(GlobalGameState.playerInvincibleTime, () => {
					GlobalGameState.invincible = false;
				});
			}
		}
		return false;
	}

	destroy() {
		this.tint = undefined;
		super.destroy();
	}
}
