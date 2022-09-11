import { NineSliceSprite, level, collision, Body, Rect, Sprite } from "melonjs";
import { my_collision_types } from "../util/constants";


export class BaseWeapon extends Sprite {
	constructor(x, y, options) {
		super(x, y, options);

		// set the bodx for collision etc.
		this.body = new Body(this);
		//this.body.addShape(new Rect(0, 0, options.width, options.height));
		this.body.ignoreGravity = true;
        this.body.isStatic = true;
		this.body.collisionType = collision.types.PROJECTILE_OBJECT;
		this.body.setCollisionMask(collision.types.ENEMY_OBJECT | my_collision_types.REMOTE_PLAYER);
		this.alwaysUpdate = true;

		/**
		 * To be set on multiplayer. Who was throwing this weapon?
		 */
		this.thrownByPlayer = null;

		/**
		 * Who is the owner of this?
		 */
		this.owner = options.owner || null;

		/**
		 * The borderlayer of the map. If there is a tile at x/y, don't get further
		 */
		this.borderLayer = null;

		/**
		 * Set to true as soon, as this weapon is active and could hurt anybody else
		 */
		this.isExploding = false;

		/**
		 * Width of the current map
		 */
		this.mapWidth = level.getCurrentLevel().cols;

		/**
		 * Height of the current map
		 */
		this.mapHeight = level.getCurrentLevel().rows;

		// setup layer
		let layers = level.getCurrentLevel().getLayers();
		layers.forEach((l) => {
			if (l.name === "Frame") this.borderLayer = l;
		});
	}

    /**
     * Checks to see if anything can go to the given point
     * @param {number} x map coord
     * @param {number} y map coord
     * @returns 
     */
	isWalkable(x, y) {
		if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
			return false;
		}
		let tile = this.borderLayer.cellAt(x, y);
		if (tile !== null) return false;
		else return true;
	}


	/**
	 * colision handler
	 * (called when colliding with other objects)
	 */
	onCollision(response, other) {
		// Make all other objects solid

		return false;
	}
}