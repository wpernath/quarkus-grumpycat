import GolemEnemySprite from "../golem-enemy";
import { EnemyReplayer } from "./enemy-replayer";

export class RemoteGolemSprite extends GolemEnemySprite {
	constructor(x, y, actions) {
		super(x, y);

		this.replayer = new EnemyReplayer(this, actions);
	}

	updatePosition(dt) {
		this.replayer.playNext(dt);
	}

	sendEnemyMovement() {
		// replay enemies don't need to send anything to server
	}
}
