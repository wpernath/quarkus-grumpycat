import { BONUS_TILE } from "../../util/constants";
import BaseTerrainSprite from "./terrain-sprite";
import { collision } from "melonjs";

export default class ChestBonusSprite extends BaseTerrainSprite {
	/**
	 *
	 * @param {number} x map coordinate
	 * @param {number} y map coordinate
	 */
	constructor(x, y) {
		super(x, y, [BONUS_TILE.closedChest-1]);
        this.addAnimation("opened", [BONUS_TILE.openedChest-1])
        this.isCollected = false;
	}

	onCollision(response, other) {
		if (other.body.collisionType === collision.types.PLAYER_OBJECT) {        
			this.setCurrentAnimation("opened");
            this.isCollected = true;
		}
	}
}
