import { collision} from "melonjs/dist/melonjs.module.js";
import GlobalGameState from "../util/global-game-state";
import { BaseEnemySprite, ENEMY_TYPES } from "./base-enemy";

export class CatEnemy extends BaseEnemySprite {
	SPEED = 2;
	updateTime = 0;
	


	/**
	 * constructor
	 */
	constructor(x, y) {
		// call the parent constructor
		super(x, y, 32, 32, "cat_left");
		this.enemyType = ENEMY_TYPES.cat;
	}

	/**
	 * update the entity
	 */
	update(dt) {	
		this.updateTime += dt;
		if( this.updateTime < 32 ) {
			super.update(dt);
			return false;
		}
		else {
			this.updateTime = 0;
		}

		if( !this.isStunned ) {
			if( !this.nextPositionFound) {					
				this.calculateNextPosition();			
			}
			if( this.nextPositionFound ) {
				
				this.pos.x += this.nextPosition.dx;
				this.pos.y += this.nextPosition.dy;

				if (this.nextPosition.dx < 0) this.flipX(false);
				else if (this.nextPosition.dx > 0) this.flipX(true);

				let x = Math.floor(this.pos.x / 32);
				let y = Math.floor(this.pos.y / 32);
				if( x == this.nextPosition.x && y == this.nextPosition.y) {
					this.nextPositionFound = false;
				}
			}        
		}
		super.update(dt);
		return true;
	}

	/**
	 * colision handler
	 * (called when colliding with other objects)
	 */
	onCollision(response, other) {
		if( other.body.collisionType === collision.types.PROJECTILE_OBJECT ) {			
			if( other.isExploding && !this.isStunned) {
				this.isStunned = true;
				GlobalGameState.score += GlobalGameState.scoreForStunningCat;
				GlobalGameState.stunnedCats++;
				this.flicker(GlobalGameState.enemyStunnedTime, () => {
					this.isStunned = false;
				});
			}
		}
		return false;
	}
}
export default CatEnemy;
