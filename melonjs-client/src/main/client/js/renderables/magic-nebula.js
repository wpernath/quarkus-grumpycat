import { Sprite, Body, Rect, collision, game, level, Vector2d, timer } from "melonjs";
import { my_collision_types } from "../util/constants";
import { BaseWeapon } from "./base-weapon";


/**
 * Magic Nebula:
 * Throws a nebula to the ground and 15sec long enemies with path finding 
 * think this would be the player and are trying to reach it. 
 * If they reached it, they get injured (spiders) or stunned (cat, golem)
 */
export default class MagicNebula extends BaseWeapon {
	isExploding = true;
	mapX;
	mapY;

	constructor(owner, x, y) {
		super(x * 32 + 16, y * 32 + 16, {
			width: 100,
			height: 100,
			image: "magic-vortex",
			framewidth: 100,
			frameheight: 100,
			anchorPoint: new Vector2d(0.5, 0.5),
		});

		this.mapX  = x;
		this.mapY  = y;
		this.owner = owner;
		
		this.body.addShape(new Rect(28, 32, 34, 30));
		this.alwaysUpdate = true;

		this.addAnimation(
			"spin",
			[
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
				45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
			],
			24
		);

		this.maxHits = 5;

		this.owner.hasPlacedNebula = true;
		this.setCurrentAnimation("spin");
		this.timerId = timer.setTimeout(
			() => {
				this.isStopped = true;
				game.world.removeChild(this);
				this.owner.spell = null;
				this.owner.hasPlacedNebula = false;
			},
			15000,
			true
		);
	}

	onCollision(response, other) {
		if (other.body.collisionType === collision.types.ENEMY_OBJECT && !other.isStunned && !other.isDead) {
			this.maxHits--;
			if (this.maxHits <= 0) {
				game.world.removeChild(this);
				this.owner.spell = null;
				this.owner.hasPlacedNebula = false;				
			}
		}
	}

	destroy() {
		if( this.timerId !== undefined && this.timerId !== 0 ) {
			timer.clearTimeout(this.timerId);
		}
		super.destroy();
	}
}
