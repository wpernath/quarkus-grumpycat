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
    }
}