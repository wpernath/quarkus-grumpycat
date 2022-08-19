import { Sprite, Body, Rect, collision, game, level, Vector2d } from "melonjs";
import { my_collision_types } from "../util/constants";
import ExplosionEntity from "./explosion";

export default class MagicBolt extends Sprite {
	VELOCITY = 0.5;
    isStopped = true;
    isExploding = false;

	constructor(owner, x, y, dx, dy) {
		super(x*32+16, y*32+16, {
			width: 100,
			height: 100,
			image: "magic-bolt",
			framewidth: 100,
			frameheight: 100,
            anchorPoint: new Vector2d(0.5,0.5),
		});

        this.owner = owner;
		this.dx = dx;
		this.dy = dy;

		this.body = new Body(this);
		this.body.addShape(new Rect(28, 32, 34, 30));
		this.body.ignoreGravity = true;
		this.body.collisionType = collision.types.PROJECTILE_OBJECT;
		this.body.setCollisionMask(collision.types.ENEMY_OBJECT | my_collision_types.REMOTE_PLAYER);
		this.alwaysUpdate = true;

		this.addAnimation("start", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 6);
		this.addAnimation("bruzzel", [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53], 6);
		this.addAnimation("boom", [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80], 2);

        let layers = level.getCurrentLevel().getLayers();
        this.mapWidth = level.getCurrentLevel().cols;
        this.mapHeight = level.getCurrentLevel().rows;

        layers.forEach((l) => {
            if (l.name === "Frame") this.borderLayer = l;
        });

		this.setCurrentAnimation("start", () => {
            this.isStopped = false;
            this.isExploding = true;
            this.setCurrentAnimation("bruzzel");
        });
	}

	update(dt) {
        if( !this.isStopped ) {
            this.pos.x += this.dx * (dt * this.VELOCITY);
            this.pos.y += this.dy * (dt * this.VELOCITY);
            let mapX = Math.floor(this.pos.x / 32);
            let mapY = Math.floor(this.pos.y / 32);

            if( !this.isWalkable(mapX, mapY)) {
                this.isStopped = true;
                this.setCurrentAnimation("boom", () => {
                    game.world.removeChild(this);
                    this.owner.spell = null;
                    game.world.addChild(new ExplosionEntity(this.pos.x, this.pos.y));
                });
            }
        }
		return super.update(dt);
	}

	isWalkable(x, y) {
		if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
			return false;
		}
		let tile = this.borderLayer.cellAt(x, y);
		if (tile !== null) return false;
		else return true;
	}

    onCollision(response, other) {
        if( other.body.collisionType === collision.types.ENEMY_OBJECT ) {
            this.isStopped = true;
            this.pos.x = other.pos.x;
            this.pos.y = other.pos.y;
            this.setCurrentAnimation("boom", () => {
                game.world.removeChild(this);
                this.owner.spell = null;
                game.world.addChild(new ExplosionEntity(this.pos.x, this.pos.y));
            });
        }

    }
}