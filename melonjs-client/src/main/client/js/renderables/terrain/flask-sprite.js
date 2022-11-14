import { BONUS_TILE } from "../../util/constants";
import BaseTerrainSprite from "./terrain-sprite";
import { collision } from "melonjs/dist/melonjs.module.js";

export default class FlaskBonusSprite extends BaseTerrainSprite {
	/**
	 *
	 * @param {number} x map coordinate
	 * @param {number} y map coordinate
	 */
	constructor(x, y) {
		super(x, y, [BONUS_TILE.magicBolt - 1]);		
		this.isCollected = false;
	}

	onCollision(response, other) {
		if (other.body.collisionType === collision.types.PLAYER_OBJECT) {            
			this.isCollected = true;
		}
	}
}
