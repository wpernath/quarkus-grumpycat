import { collision } from "melonjs/dist/melonjs.module.js";
import { BaseEnemySprite, ENEMY_TYPES } from "./base-enemy";
import GlobalGameState from "../util/global-game-state";
import NetworkManager from "../util/network";

export class SpiderEnemy extends BaseEnemySprite {
	posUpdatedCount = 0;
	VELOCITY = 0.1;

	constructor(x, y) {
		super(x, y, {
			width: 64,
			height: 64,
			framewidth: 64,
			frameheight: 64,
			image: "spider-red",
		});

		this.enemyType = ENEMY_TYPES.spider;

		this.addAnimation("stand-up", [0]);
		this.addAnimation("walk-up", [4, 5, 6, 7, 8, 9], 32);
		this.addAnimation("attack-up", [0, 1, 2, 3], 32);

		this.addAnimation("stand-left", [10]);
		this.addAnimation("walk-left", [14, 15, 16, 17, 18, 19], 32);
		this.addAnimation("attack-left", [10, 11, 12, 13], 32);

		this.addAnimation("stand-down", [20]);
		this.addAnimation("walk-down", [24, 25, 26, 27, 28, 29], 32);
		this.addAnimation("attack-down", [20, 21, 22, 23], 32);

		this.addAnimation("stand-right", [30]);
		this.addAnimation("walk-right", [34, 35, 36, 37, 38, 39], 32);
		this.addAnimation("attack-right", [30, 31, 32, 33], 32);

		this.addAnimation("die", [40, 41, 42, 43], 100);
		this.addAnimation("dead", [43]);
		this.setCurrentAnimation("stand-left");

		// spiders can only walk up/down/left/right
		this.enemyCanWalkDiagonally = false;
	}

	updatePosition(dt) {
		if (!this.isStunned && !this.isDead) {
			if (!this.nextPositionFound) {
				this.posUpdatedCount = 0;
				this.calculateNextPosition();
			}
			if (this.nextPositionFound) {
				let posFactor = dt * this.VELOCITY;
				this.pos.x += this.nextPosition.dx * posFactor;
				this.pos.y += this.nextPosition.dy * posFactor;

				// change walking anim if changed
				if (this.nextPosition.last.dx != this.nextPosition.dx || this.nextPosition.last.dy != this.nextPosition.dy) {
					if (this.nextPosition.dx < 0) this.setCurrentAnimation("walk-left", "walk-left");
					else if (this.nextPosition.dx > 0) this.setCurrentAnimation("walk-right", "walk-right");

					if (this.nextPosition.dy < 0) this.setCurrentAnimation("walk-up", "walk-up");
					else if (this.nextPosition.dy > 0) this.setCurrentAnimation("walk-down", "walk-down");
				}

				this.posUpdatedCount += dt;
				posFactor = this.posUpdatedCount * this.VELOCITY;
				if (posFactor >= 32) {
					this.nextPositionFound = false;
					this.posUpdatedCount = 0;
				}

				NetworkManager.getInstance()
					.writeEnemyUpdate(this.nextPosition)
					.catch((err) => console.err("error enemy action: " + err));
			} else {
				// no new position. enemy just stands still

				if (this.nextPosition.dx < 0) this.setCurrentAnimation("stand-left");
				else if (this.nextPosition.dx > 0) this.setCurrentAnimation("stand-right");

				if (this.nextPosition.dy < 0) this.setCurrentAnimation("stand-up");
				else if (this.nextPosition.dy > 0) this.setCurrentAnimation("stand-down");
			}
		}
		return true;
	}

	onCollision(response, other) {
		if (other.body.collisionType === collision.types.PROJECTILE_OBJECT) {
			if (other.isExploding && !this.isStunned && !this.isDead) {
				this.isStunned = true;
				this.nextPosition.isStunned = true;
				this.nextPosition.isDead = true;
				this.setCurrentAnimation("die", () => {
					this.isDead = true;
					GlobalGameState.killedSpiders++;
					GlobalGameState.score += GlobalGameState.scoreForKillingSpider;
					this.setCurrentAnimation("dead");
				});
			}
		} else if (other.body.collisionType === collision.types.PLAYER_OBJECT && !this.isDead && !this.isStunned && !GlobalGameState.invincible) {
			if (this.nextPosition.dx < 0) this.setCurrentAnimation("attack-left");
			else if (this.nextPosition.dx > 0) this.setCurrentAnimation("attack-right");

			if (this.nextPosition.dy < 0) this.setCurrentAnimation("attack-up");
			else if (this.nextPosition.dy > 0) this.setCurrentAnimation("attack-down");
		}
		return false;
	}
}
export default SpiderEnemy;