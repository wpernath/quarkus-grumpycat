export class EnemyReplayer {
	lastPlayerAction = null;
	lastReplay = 0;

	constructor(enemy, actions) {
		this.enemy = enemy;
		this.playerActions = actions;
		this.replayActionIndex = 0;
		this.replayDone = false;
	}

	playNext(dt) {
        if( this.replayDone ) return;

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
					return;
				}
			}
            
			this.lastReplay = performance.now();
			this.lastPlayerAction = playerAction;
			this.replayActionIndex++;

            if( playerAction.isDead ) {
                // dying / dead
            }
            else if( playerAction.isStunned ) {
                // stunning
            }
            else {
				this.enemy.pos.x = playerAction.x * 32 + 16;
				this.enemy.pos.y = playerAction.y * 32 + 16;
            }

        }
		else {
			if (!this.replayDone) {				
				this.replayDone = true;
			}
		}
    }
}