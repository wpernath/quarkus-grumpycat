import { collision } from "melonjs";
import { BaseEnemySprite } from "./base-enemy";
import { ENEMY_TYPES } from "./base-enemy";
import GlobalGameState from "../util/global-game-state";

export default class GolemEnemySprite extends BaseEnemySprite {
	SPEED = 1;
	constructor(x, y) {
		super(x, y, 64, 64, "golem-walk");
		this.enemyType = ENEMY_TYPES.golem;

		this.addAnimation("stand-up", [0]);
		this.addAnimation("walk-up", [0, 1, 2, 3, 4, 5, 6], 48);

		this.addAnimation("stand-left", [7]);
		this.addAnimation("walk-left", [7, 8, 9, 10, 11, 12, 13], 48);

		this.addAnimation("stand-down", [14]);
		this.addAnimation("walk-down", [14, 15, 16, 17, 18, 19, 20], 48);

		this.addAnimation("stand-right", [20]);
		this.addAnimation("walk-right", [20, 21, 22, 23, 24, 25, 26], 48);

		//		this.addAnimation("die", [40, 41, 42, 43], 100);
		//		this.addAnimation("dead", [43]);
		this.setCurrentAnimation("stand-left");

		// golems can only walk up/down/left/right
		this.enemyCanWalkDiagonally = false;
	}

	update(dt) {
		if (!this.isStunned) {
			if (!this.nextPositionFound) {
				this.calculateNextPosition();
			}
			if (this.nextPositionFound) {
				this.pos.x += this.nextPosition.dx;
				this.pos.y += this.nextPosition.dy;

				// change walking anim if changed
				if (this.nextPosition.last.dx != this.nextPosition.dx || this.nextPosition.last.dy != this.nextPosition.dy) {
					if (this.nextPosition.dx < 0) this.setCurrentAnimation("walk-left", "walk-left");
					else if (this.nextPosition.dx > 0) this.setCurrentAnimation("walk-right", "walk-right");

					if (this.nextPosition.dy < 0) this.setCurrentAnimation("walk-up", "walk-up");
					else if (this.nextPosition.dy > 0) this.setCurrentAnimation("walk-down", "walk-down");
				}
				let x = Math.floor(this.pos.x / 32);
				let y = Math.floor(this.pos.y / 32);
				if (x == this.nextPosition.x && y == this.nextPosition.y) {
					this.nextPositionFound = false;
				}
			} else {
				// no new position. enemy just stands still

				if (this.nextPosition.dx < 0) this.setCurrentAnimation("stand-left");
				else if (this.nextPosition.dx > 0) this.setCurrentAnimation("stand-right");

				if (this.nextPosition.dy < 0) this.setCurrentAnimation("stand-up");
				else if (this.nextPosition.dy > 0) this.setCurrentAnimation("stand-down");
			}
		}
		super.update(dt);
		return true;
	}

	onCollision(response, other) {
		if (other.body.collisionType === collision.types.PROJECTILE_OBJECT) {
			if (other.isExploding) {
				this.isStunned = true;
				if (this.nextPosition.dx < 0) this.setCurrentAnimation("stand-left");
				else if (this.nextPosition.dx > 0) this.setCurrentAnimation("stand-right");

				if (this.nextPosition.dy < 0) this.setCurrentAnimation("stand-up");
				else if (this.nextPosition.dy > 0) this.setCurrentAnimation("stand-down");

				this.flicker(GlobalGameState.enemyStunnedTime, () => {
					this.isStunned = false;
					GlobalGameState.stunnedGolems++;
					GlobalGameState.score += GlobalGameState.scoreForStunningGolem;
				});
			}
		} 
		else if (other.body.collisionType === collision.types.PLAYER_OBJECT && !this.isDead && !this.isStunned && !GlobalGameState.invincible) {
		}
		return false;
	}
}