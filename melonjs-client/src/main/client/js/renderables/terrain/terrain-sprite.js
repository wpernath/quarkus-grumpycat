import { Sprite, Body, Rect, collision, game, level, Vector2d } from "melonjs";
import { my_collision_types } from "../../util/constants";


/**
 * BaseTerrain Sprite: Uses the terrain.png to draw some grafics
 */
export default class BaseTerrainSprite extends Sprite {	

	constructor(x, y, animFrame) {
		super(x * 32 + 16, y * 32 + 16, {
			width: 32,
			height: 32,
			image: "terrain",
			framewidth: 32,
			frameheight: 32,
			anchorPoint: new Vector2d(0.5, 0.5),
		});

        this.animFrame = animFrame;
		this.body = new Body(this);
		this.body.addShape(new Rect(0,0, this.width, this.height));
		this.body.ignoreGravity = true;
		this.body.collisionType = collision.types.COLLECTABLE_OBJECT;
		this.body.setCollisionMask(collision.types.PLAYER_OBJECT | my_collision_types.REMOTE_PLAYER);
        this.body.setStatic(true);
        this.addAnimation("start", animFrame, 60);

		let layers = level.getCurrentLevel().getLayers();
		this.mapWidth = level.getCurrentLevel().cols;
		this.mapHeight = level.getCurrentLevel().rows;

		layers.forEach((l) => {
			if (l.name === "Frame") this.borderLayer = l;
		});

        this.setCurrentAnimation("start");

        this.type = animFrame[0];
        this.isCollected = false;
	}

	update(dt) {
		return super.update(dt);
	}

	onCollision(response, other) {
		if (other.body.collisionType === collision.types.PLAYER_OBJECT) {
			game.world.removeChild(this);
            this.isCollected = true;
            return false;
		}
	}
}
