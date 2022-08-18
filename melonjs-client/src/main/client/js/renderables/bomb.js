import { collision, level, game, Sprite, Body, Rect } from "melonjs/dist/melonjs.module.js";

class BombEntity extends Sprite {
	borderLayer;
	isExploding = false;

	/**
	 * constructor
	 */
	constructor(x, y) {
		// call the parent constructor
		super(x, y, {
			width: 32,
			height: 64,
			image: "BombExploding",
			framewidth: 32,
			frameheight: 64,
		});

		let layers = level.getCurrentLevel().getLayers();
		layers.forEach((l) => {
			if (l.name === "Frame") this.borderLayer = l;
		});

		this.body = new Body(this);
		this.body.addShape(new Rect(0, 0, 96, 96));
		this.body.ignoreGravity = true;
		this.body.collisionType = collision.types.PROJECTILE_OBJECT;
		this.body.setCollisionMask(collision.types.ENEMY_OBJECT);

		// add animations
		this.alwaysUpdate = true;
		this.thrownByPlayer = null;

		this.addAnimation("bzzz", [0, 1, 2, 3, 4, 5, 6]);
		this.addAnimation("boom", [7, 8, 9, 10, 11, 12, 13]);
		this.setCurrentAnimation("bzzz", function () {
			game.viewport.shake(50, 400);
			this.isExploding = true;
			this.setCurrentAnimation("boom", function () {
				this.isExploding = false;
				game.world.removeChild(this);
				// remove all frames in a 3/3 radius
				let rad = [
					{ x: -1, y: -1 },
					{ x: 0, y: -1 },
					{ x: +1, y: -1 },
					{ x: -1, y: 0 },
					{ x: +1, y: 0 },
					{ x: -1, y: +1 },
					{ x: 0, y: +1 },
					{ x: +1, y: +1 },
				];
				rad.forEach((pos) => {
					let x = Math.floor((this.pos.x + pos.x * 32) / 32);
					let y = Math.floor((this.pos.y + pos.y * 32) / 32);					
					this.borderLayer.clearTile(x, y);
				});
				return false;
			});
		});
	}

	/**
	 * update the entity
	 */
	update(dt) {
		// call the parent method

		super.update(dt);
		return true;
	}

	/**
	 * colision handler
	 * (called when colliding with other objects)
	 */
	onCollision(response, other) {
		// Make all other objects solid

		return false;
	}

	destroy() {
		this.tint = undefined;
		super.destroy();
	}
}

export default BombEntity;
