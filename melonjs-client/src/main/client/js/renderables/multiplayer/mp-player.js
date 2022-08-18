import { BasePlayerSprite } from "../base-player";
import GlobalGameState from "../../util/global-game-state";
import { game, state } from "melonjs";
import BombEntity from "../bomb";
import MultiplayerManager from "../../util/multiplayer";


export class MPRemotePlayerSprite extends BasePlayerSprite {

	constructor(x, y, player, color) {
		super(x, y);
		this.player = player;
		this.color  = color;
		this.tint   = color;
		//let globalThis = this;

		MultiplayerManager.getInstance().addOnMessageCallback( (event) => {
			let message = event.message;

			// make sure we only interpret movements for THIS sprite
			if (message.playerId === this.player.id) {
				//console.log("MESSAGE: " + JSON.stringify(message));

				// only ours
				if (message.gutterThrown) {
					this.placeBorderTile(message.x + message.dx, message.y + message.dy);
				} 
				else if (message.bombPlaced) {
					this.pos.x = message.x * 32 + 16;
					this.pos.y = message.y * 32 + 16;

					game.world.addChild(new BombEntity(this.pos.x, this.pos.y));
				} 
				else {
					//console.log(" updating pos of " + this.name + " to " + this.pos );
					// just movement					
					this.pos.x = message.x * 32 + 16;
					this.pos.y = message.y * 32 + 16;

					this.checkBonusTile(this.pos.x, this.pos.y);
				}
			}
		});
		
	}

	update(dt) {
		return super.update(dt);
	}

	onUpdate(event) {
	}
}
