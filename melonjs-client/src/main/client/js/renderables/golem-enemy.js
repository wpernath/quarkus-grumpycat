import { collision, Vector2d } from "melonjs";
import { BaseEnemySprite } from "./base-enemy";
import { ENEMY_TYPES } from "./base-enemy";
import GlobalGameState from "../util/global-game-state";
import NetworkManager from "../util/network";
import { my_collision_types } from "../util/constants";

export default class GolemEnemySprite extends BaseEnemySprite {
	posUpdatedCount = 0;
	VELOCITY = 0.08;

	constructor(x, y, storeEnemyMovements = true) {
		super(x, y, {
			width: 64,
			height: 64,
			framewidth: 64,
			frameheight: 64,
			image: "golem-walk",			
		});
		this.enemyType = ENEMY_TYPES.golem;
		this.storeEnemyMovements = storeEnemyMovements;

		this.addAnimation("stand-up", [0]);
		this.addAnimation("walk-up", [0, 1, 2, 3, 4, 5, 6], 48);

		this.addAnimation("stand-left", [7]);
		this.addAnimation("walk-left", [7, 8, 9, 10, 11, 12, 13], 48);

		this.addAnimation("stand-down", [14]);
		this.addAnimation("walk-down", [14, 15, 16, 17, 18, 19, 20], 48);

		this.addAnimation("stand-right", [21]);
		this.addAnimation("walk-right", [21, 22, 23, 24, 25, 26, 27], 48);

		this.setCurrentAnimation("stand-left");

		// golems can only walk up/down/left/right
		this.enemyCanWalkDiagonally = false;
		this.wayPath = null;
	}

	setWayPath(p) {
		this.wayPath = p;
		//console.log(this.name + " path = " + JSON.stringify(p));
	}

	/**
	 * Overwritten method to make sure we are going to get the path from Map
	 */
	calculateNextPosition() {
		let weAreAt = this.transformPosition();
		let goTo = this.wayPath.getCurrentWayPoint();
		if( weAreAt.x === goTo.x && weAreAt.y === goTo.y ) {
			goTo = this.wayPath.getNextWayPoint();
		}
		this.calculateNextPositionToTarget(goTo.x, goTo.y);
		
	}

	updatePosition(dt) {
		if (!this.isStunned) {
			if (!this.nextPositionFound) {
				this.posUpdatedCount = 0;
				this.calculateNextPosition();
				if (this.nextPositionFound) this.sendEnemyMovement();
			}
			if (this.nextPositionFound) {
				let posFactor = dt * this.VELOCITY;
				this.pos.x += this.nextPosition.dx * posFactor;
				this.pos.y += this.nextPosition.dy * posFactor;

				// change walking anim if changed
				if (this.nextPosition.last.dx != this.nextPosition.dx || this.nextPosition.last.dy != this.nextPosition.dy) {
					if (this.nextPosition.dx < 0) this.setCurrentAnimation("walk-left");
					else if (this.nextPosition.dx > 0) this.setCurrentAnimation("walk-right");

					if (this.nextPosition.dy < 0) this.setCurrentAnimation("walk-up");
					else if (this.nextPosition.dy > 0) this.setCurrentAnimation("walk-down");
				}

				this.posUpdatedCount += dt;
				posFactor = this.posUpdatedCount * this.VELOCITY;
				if (posFactor >= 32) {
					this.nextPositionFound = false;
					this.posUpdatedCount = 0;
				}

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
		if (other.body.collisionType === collision.types.PROJECTILE_OBJECT || other.body.collisionType === my_collision_types.REMOTE_BOMB) {
			if (other.isExploding) {
				this.isStunned = true;
				if (this.nextPosition.dx < 0) this.setCurrentAnimation("stand-left");
				else if (this.nextPosition.dx > 0) this.setCurrentAnimation("stand-right");

				if (this.nextPosition.dy < 0) this.setCurrentAnimation("stand-up");
				else if (this.nextPosition.dy > 0) this.setCurrentAnimation("stand-down");

				let otherIsProjectile = other.body.collisionType === collision.types.PROJECTILE_OBJECT;
				this.flicker(GlobalGameState.enemyStunnedTime, () => {
					this.isStunned = false;
					if( otherIsProjectile ) {
						GlobalGameState.stunnedGolems++;
						GlobalGameState.score += GlobalGameState.scoreForStunningGolem;
					}
				});
			}
		} 
		else if (other.body.collisionType === collision.types.PLAYER_OBJECT && !this.isDead && !this.isStunned && !GlobalGameState.invincible) {
			// golems don't attack (because they don't have an attacking animation)
			// golems just go their path
			//if (this.nextPosition.dx < 0) this.setCurrentAnimation("stand-left");
			//else if (this.nextPosition.dx > 0) this.setCurrentAnimation("stand-right");

			//if (this.nextPosition.dy < 0) this.setCurrentAnimation("stand-up");
			//else if (this.nextPosition.dy > 0) this.setCurrentAnimation("stand-down");
		}
		return false;
	}
}