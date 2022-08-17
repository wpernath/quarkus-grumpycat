import { BasePlayerSprite } from "../base-player";
import GlobalGameState from "../../util/global-game-state";
import { game, state } from "melonjs";
import BombEntity from "../bomb";
import MultiplayerManager from "../../util/multiplayer";


export class MPRemotePlayerSprite extends BasePlayerSprite {

	constructor(x, y, player) {
		super(x, y);
		this.player = player;
		//MultiplayerManager.getInstance().
	}

	update(dt) {
		return super.update(dt);
	}
}
