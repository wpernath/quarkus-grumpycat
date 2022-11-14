import {game} from "melonjs";
import { BONUS_TILE } from "../../util/constants";
import BaseTerrainSprite from "./terrain-sprite";

export default class PillBonusSprite extends BaseTerrainSprite {
    /**
     * 
     * @param {number} x map coordinate
     * @param {number} y map coordinate
     */
    constructor(x,y) {
        super(x,y, [BONUS_TILE.cactus, BONUS_TILE.cactus + 1, BONUS_TILE.cactus + 2]);
        this.mapX = x;
        this.mapY = y;

        this.targetY = 0;
        this.targetX = game.viewport.width / 2;

        this.dx = this.pos.x - this.targetX;
        this.dy = this.pos.y - this.targetY;
    }

    update(dt) {
        this.pos.x += this.dx;
        this.pos.y += this.dy;
        return super.update(dt);
    }

}