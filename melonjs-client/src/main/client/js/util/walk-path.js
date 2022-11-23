import { Vector2d } from "melonjs/dist/melonjs.module.js";

export class WayPoint {

    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.pos = new Vector2d(x,y);
        this.pos.z = 0;
        this.onResetEvent(x,y);

    }

    onResetEvent(x,y) {
        this.x = x;
        this.y = y;
        this.z = 0;
        this.pos.x = x;
        this.pos.y = y;
        this.forEnemy = "";
    }

    update() {}
}


export class WayPath {
	constructor(x, y, id=-1) {
        this.id = id;
		this.x = x;
		this.y = y;
		this.pos = new Vector2d(x, y);
		this.pos.z = 0;
        this.currentPoint = 0;
        this.points = [];
		this.onResetEvent(x, y);
	}

	onResetEvent(x, y) {
		this.x = x;
		this.y = y;
		this.z = 0;
        this.pos.x = x;
        this.pos.y = y;
        this.points = [];
		this.forEnemy = "";
	}

    addWayPoint(point) {
        this.points.push(point);
    }

    getCurrentWayPoint() {
        return this.points[this.currentPoint];
    }

    getNextWayPoint() {
        this.currentPoint++;
        if( this.currentPoint >= this.points.length ) {
            this.currentPoint = 0;
        }
        return this.getCurrentWayPoint();
    }
	update() {}
}