import { BONUS_TILE } from "../../util/constants";
import { collision, Sprite, Vector2d, Body, level, Rect } from "melonjs";
import { my_collision_types } from "../../util/constants";
import GlobalGameState from "../../util/global-game-state";

export default class ChestBonusSprite extends Sprite {
	/**
	 *
	 * @param {number} x map coordinate
	 * @param {number} y map coordinate
	 */
	constructor(x, y) {
		super(x*32+16, y*32+16, {
			width: 48,
			height: 48,
			image: "open-chest",
			framewidth: 48,
			frameheight: 48,
			anchorPoint: new Vector2d(0.5, 0.5),
		});

		this.body = new Body(this);
		this.body.addShape(new Rect(8, 8, 32,32));
		this.body.ignoreGravity = true;
		this.body.collisionType = collision.types.COLLECTABLE_OBJECT;
		this.body.setCollisionMask(collision.types.PLAYER_OBJECT | my_collision_types.REMOTE_PLAYER);
		this.body.setMaxVelocity(0,0);
		this.body.setFriction(0,0);
		//this.body.setStatic(true);

		this.addAnimation("closed", [0,1,2,1], 100);
		this.addAnimation("opening", [0,1,2,3,4,5,6,7], 24);
		this.addAnimation("opened", [7]);

		let layers = level.getCurrentLevel().getLayers();
		this.mapWidth = level.getCurrentLevel().cols;
		this.mapHeight = level.getCurrentLevel().rows;

		layers.forEach((l) => {
			if (l.name === "Frame") this.borderLayer = l;
		});

		this.setCurrentAnimation("closed");

		this.type = BONUS_TILE.closedChest;

        this.isCollected = false;
		this.isOpening = false;
		this.mapX = x;
		this.mapY = y;

		// define what is IN this chest
		this.score = GlobalGameState.scoreForChest;
		this.numBombs = 0;
		this.numMagicProtectionCircle = 0;
		this.numMagicBolts = 0;
		this.numMagicNebula = 0;
		this.numMagicFirespin = 0;
	}

	onCollision(response, other) {
		if( !this.isOpening ) {
			this.isOpening = true;				
			this.setCurrentAnimation("opening", () => {
				this.isCollected = true;
				this.setCurrentAnimation("opened");
			});
		}
		return false;
	}
}
