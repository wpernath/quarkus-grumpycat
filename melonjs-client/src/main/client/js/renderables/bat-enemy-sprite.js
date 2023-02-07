import { collision, Vector2d } from "melonjs/dist/melonjs.module.js";
import { BaseEnemySprite } from "./base-enemy";
import { ENEMY_TYPES } from "./base-enemy";
import GlobalGameState from "../util/global-game-state";
import NetworkManager from "../util/network";
import { my_collision_types } from "../util/constants";

export default class BatEnemySprite extends BaseEnemySprite {
	posUpdatedCount = 0;
	VELOCITY = 0.08;
	
	constructor(x, y, storeEnemyMovements = true) {
		super(x, y, {
			width: 32,
			height: 32,
			framewidth: 32,
			frameheight: 32,
			image: "bat",			
		});
		this.enemyType = ENEMY_TYPES.bat;
		this.storeEnemyMovements = storeEnemyMovements;
    }
}