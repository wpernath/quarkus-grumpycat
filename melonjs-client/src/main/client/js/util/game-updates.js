import GlobalGameState from "./global-game-state";

export class EnemyAction {
	name;
	type;
	hasChanged = false;
	isStunned = false;
	isDead = false;
	hasChanged = false;
	
	x = 0;
	y = 0;
	dx = 0;
	dy = 0;

	last = {
		dx: 0,
		dy: 0
	};

	constructor(name, type, x, y, dx, dy) {
		this.name = name;
		this.type = type;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	}
}

export class GameStateAction {
	playerId;
	gameId;

	x = 0;
	y = 0;
	dx = 0;
	dy = 0;

	bombPlaced = false;
	gutterThrown = false;
	gameOver = false;
	gameWon = false;
	isInvincible = false;
	hasChanged = false;
	score;
	time;

	enemies = [];

	constructor(x, y, dx, dy) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;

		this.playerId = GlobalGameState.globalServerGame.player.id;
		this.gameId = GlobalGameState.globalServerGame.id;
		this.score = GlobalGameState.score;
		this.time = performance.now();
	}

	addEnemyMovement(action) {
		this.enemies.push(action);
	}
}
