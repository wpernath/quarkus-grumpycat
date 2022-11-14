import { BasePlayerSprite } from "../base-player";
import GlobalGameState from "../../util/global-game-state";
import { collision, game, state } from "melonjs/dist/melonjs.module.js";
import BombEntity from "../bomb";
import MultiplayerManager from "../../util/multiplayer";
import { my_collision_types } from "../../util/constants";

import { ENEMY_TYPES } from "../base-enemy";

export class MPRemotePlayerSprite extends BasePlayerSprite {
	constructor(x, y, player, color) {
		super(x, y);
		this.player = player;
		this.color = color;
		this.tint = color;
		this.invincible = false;

		this.body.collisionType = my_collision_types.REMOTE_PLAYER;
		this.body.setCollisionMask(collision.types.ENEMY_OBJECT | my_collision_types.REMOTE_PROJECTILE | collision.types.PROJECTILE_OBJECT);

		MultiplayerManager.get().addOnMessageCallback(async (event) => {
			let message = event.message;

			// make sure we only interpret movements for THIS sprite
			if (message.playerId === this.player.id) {
				this.pos.x = message.x * 32 + 16;
				this.pos.y = message.y * 32 + 16;

				// only ours
				if (message.gutterThrown) {
					this.placeBorderTile(message.x + message.dx, message.y + message.dy, false);
				} 
				else if( message.magicBolt ) {
					this.throwMagicSpell(message.x, message.y, message.dx, message.dy, false);
					this.spell.body.collisionType = my_collision_types.REMOTE_PROJECTILE;
					this.spell.body.setCollisionMask(collision.types.PLAYER_OBJECT | collision.types.ENEMY_OBJECT);
					this.spell.tint.copy(this.color);
					this.spell.thrownByPlayer = this.player;
				}
				else if( message.chestCollected ) {

				}
				else if (message.magicNebula) {
					this.throwMagicNebula(message.x, message.y, false);
					this.spell.body.collisionType = my_collision_types.REMOTE_PROJECTILE;
					this.spell.body.setCollisionMask(collision.types.PLAYER_OBJECT | collision.types.ENEMY_OBJECT);
					this.spell.tint.copy(this.color);
					this.spell.thrownByPlayer = this.player;
				} 
				else if (message.magicProtectionCircle) {
					this.throwMagicProtectionCircle(message.x, message.y, false);
					this.spell.body.collisionType = my_collision_types.REMOTE_PROJECTILE;
					this.spell.body.setCollisionMask(collision.types.PLAYER_OBJECT | collision.types.ENEMY_OBJECT);
					this.spell.tint.copy(this.color);
					this.spell.thrownByPlayer = this.player;
				} 
				else if (message.magicFirespin) {
					this.throwMagicFireSpin(message.x, message.y, false);
					this.spell.body.collisionType = my_collision_types.REMOTE_PROJECTILE;
					this.spell.body.setCollisionMask(collision.types.PLAYER_OBJECT | collision.types.ENEMY_OBJECT);
					this.spell.tint.copy(this.color);
					this.spell.thrownByPlayer = this.player;
				} 
				else if (message.bombPlaced) {
					let bomb = new BombEntity(this.pos.x, this.pos.y);
					bomb.body.collisionType = my_collision_types.REMOTE_PROJECTILE;
					bomb.body.setCollisionMask(collision.types.PLAYER_OBJECT | collision.types.ENEMY_OBJECT);
					bomb.tint.copy(this.color);
					bomb.thrownByPlayer = this.player;
					game.world.addChild(bomb);
				} 
				else {
					// just movement
					this.checkBonusTile(this.pos.x, this.pos.y, false);
				}
			}
		}, this);
	}

	update(dt) {
		return super.update(dt);
	}

	/**
	 * colision handler
	 * (called when colliding with other objects)
	 */
	onCollision(response, other) {
		if (this.invincible) return false;
		if (other.body.collisionType === collision.types.ENEMY_OBJECT && !other.isStunned && !other.isDead && !GlobalGameState.isGameOver) {
			this.invincible = true;
			this.flicker(GlobalGameState.playerInvincibleTime, () => {
				this.invincible = false;
			});
		} 
		else if (other.body.collisionType === collision.types.PROJECTILE_OBJECT) {
			// a remote player is touched by our bomb
			if (other.isExploding) {
				this.invincible = true;
				GlobalGameState.score += GlobalGameState.scoreForBombingRemotePlayers;
				this.flicker(GlobalGameState.playerInvincibleTime, () => {
					this.invincible = false;
				});
			}
		}
		return false;
	}
}
