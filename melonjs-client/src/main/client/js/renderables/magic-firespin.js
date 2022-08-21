import { Sprite, Body, Rect, collision, game, level, Vector2d, timer } from "melonjs";
import { my_collision_types } from "../util/constants";
import ExplosionEntity from "./explosion";

export default class MagicFirespin extends Sprite {
	VELOCITY = 0.5;
    isStopped = false;
    isExploding = true;

	constructor(owner, x, y) {
		super(x*32+16, y*32+16, {
			width: 100,
			height: 100,
			image: "magic-firespin",
			framewidth: 100,
			frameheight: 100,
            anchorPoint: new Vector2d(0.5,0.5),
		});

        this.owner = owner;

		this.body = new Body(this);
		this.body.addShape(new Rect(28, 32, 34, 30));
		this.body.ignoreGravity = true;
		this.body.collisionType = collision.types.PROJECTILE_OBJECT;
		this.body.setCollisionMask(collision.types.ENEMY_OBJECT | my_collision_types.REMOTE_PLAYER);
		this.alwaysUpdate = true;

		this.addAnimation("spin", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61], 24);

        let layers = level.getCurrentLevel().getLayers();
        this.mapWidth = level.getCurrentLevel().cols;
        this.mapHeight = level.getCurrentLevel().rows;

        layers.forEach((l) => {
            if (l.name === "Frame") this.borderLayer = l;
        });

		this.setCurrentAnimation("spin");        
        timer.setTimeout(() => {
            this.isStopped = true;
            game.world.removeChild(this);
            this.owner.spell = null;
        }, 10000, true);

        this.currentStep = 0;
        this.maxSteps    = 45;
        this.radius      = 48;
        this.maxHits     = 5;
        this.scale(2,2);
	}

	update(dt) {
        if( !this.isStopped ) {

            let x = 0; //this.radius * Math.cos(2 * Math.PI * this.currentStep / this.maxSteps);
            let y = 0; //this.radius * Math.sin(2 * Math.PI * this.currentStep / this.maxSteps);

            this.pos.x = this.owner.pos.x + x;
            this.pos.y = this.owner.pos.y + y;
            this.currentStep++;
            if( this.currentStep >= this.maxSteps ) this.currentStep = 0;            


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
        if( other.body.collisionType === collision.types.ENEMY_OBJECT && !other.isStunned && !other.isDead) {
            this.maxHits--;
            if( this.maxHits <= 0 ) {
                this.isStopped = true;
                game.world.removeChild(this);
                this.owner.spell = null;                
            }            
        }

    }
}