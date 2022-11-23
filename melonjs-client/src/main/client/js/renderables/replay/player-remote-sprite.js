import { BasePlayerSprite } from "../base-player";
import GlobalGameState from "../../util/global-game-state";
import { game, state } from "melonjs/dist/melonjs.module.js";
import BombEntity from "../bomb";


export class PlayerRemoteSprite extends BasePlayerSprite {
	lastPlayerAction = null;
	lastReplay = 0;

	constructor(x, y) {
		super(x, y);
		this.playerActions = GlobalGameState.replayActions.playerMovements;
		this.replayActionIndex = 0;
		this.replayDone = false;

		// set the display to follow our position on both axis
		game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.1);
	}

	update(dt) {
		if (this.replayActionIndex < this.playerActions.length) {
			let playerAction = this.playerActions[this.replayActionIndex];
			let hasElapsed = 0;
			let mustElapsed = 0;

			if (this.lastPlayerAction != null) {
				// check for time
				mustElapsed = playerAction.time - this.lastPlayerAction.time;
				hasElapsed = performance.now() - this.lastReplay;
				if (hasElapsed < mustElapsed) {
					// skip this frame
					return super.update(dt);
				}
			}
			this.lastReplay = performance.now();
			this.lastPlayerAction = playerAction;
			this.replayActionIndex++;

			if (playerAction.gutterThrown) {
				this.placeBorderTile(playerAction.x + playerAction.dx, playerAction.y + playerAction.dy);
			} 
			else if (playerAction.bombPlaced) {
				this.pos.x = playerAction.x * 32 + 16;
				this.pos.y = playerAction.y * 32 + 16;

				game.world.addChild(new BombEntity(this.pos.x, this.pos.y));
				GlobalGameState.usedBombs++;
				GlobalGameState.bombs--;
			} 
			else {
				// just movement
				this.pos.x = playerAction.x * 32 + 16;
				this.pos.y = playerAction.y * 32 + 16;

				this.checkBonusTile(this.pos.x, this.pos.y);
			}
		} 
		else {
			if (!this.replayDone) {
				state.change(state.MENU);
				this.replayDone = true;
			}
		}
		return super.update(dt);
	}
}
