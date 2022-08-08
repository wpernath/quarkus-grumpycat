import { collision} from "melonjs/dist/melonjs.module.js";
import GlobalGameState from "../util/global-game-state";
import { BaseEnemySprite, ENEMY_TYPES } from "./base-enemy";
import NetworkManager from "../util/network";

export class CatEnemy extends BaseEnemySprite {
	VELOCITY = 0.08;
	posUpdatedCount =0;
	/**
	 * constructor
	 */
	constructor(x, y) {
		// call the parent constructor
		super(x, y, {
			width: 32, 
			height: 32, 
			image: "cat_left"
		});
		this.enemyType = ENEMY_TYPES.cat;
	}

	/**
	 * update the entity
	 */
	updatePosition(dt) {	
		if( !this.isStunned ) {
			if( !this.nextPositionFound) {					
				this.posUpdatedCount = 0;
				this.calculateNextPosition();			
			}

			if( this.nextPositionFound ) {
				let posFactor = (dt*this.VELOCITY);
				this.pos.x += this.nextPosition.dx * posFactor;
				this.pos.y += this.nextPosition.dy * posFactor;

				if (this.nextPosition.dx < 0) this.flipX(false);
				else if (this.nextPosition.dx > 0) this.flipX(true);

				this.posUpdatedCount += dt;
				posFactor = this.posUpdatedCount * this.VELOCITY;
				if( posFactor >= 32 ) {
					this.nextPositionFound = false;
					this.posUpdatedCount = 0;
				}
				
				NetworkManager.getInstance()
					.writeEnemyUpdate(this.nextPosition)
					.catch((err) => console.err("error enemy action: " + err));
			}        
		}		
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
				this.nextPosition.isStunned = true;
				GlobalGameState.score += GlobalGameState.scoreForStunningCat;
				GlobalGameState.stunnedCats++;
				this.flicker(GlobalGameState.enemyStunnedTime, () => {
					this.isStunned = false;
					this.nextPosition.isStunned = false;
				});
			}
		}
		return false;
	}
}
export default CatEnemy;
