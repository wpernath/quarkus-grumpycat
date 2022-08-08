import { Vector2d } from "melonjs";

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
        this.forEnemy = "";
    }
}