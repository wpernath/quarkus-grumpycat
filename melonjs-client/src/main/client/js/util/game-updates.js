import GlobalGameState from "./global-game-state";

export class EnemyAction {
	playerId;
	gameId;

	name;
	type;
	hasChanged = false;
	isStunned = false;
	isDead = false;
	hasChanged = false;
	time;

	x = 0;
	y = 0;
	dx = 0;
	dy = 0;

	last = {
		dx: 0,
		dy: 0,
	};

	constructor(name, type, x, y, dx, dy) {
		this.onResetEvent(name, type,x,y,dx,dy);
	}

	onResetEvent(name, type, x, y, dx, dy) {
		this.playerId = GlobalGameState.globalServerGame.player.id;
		this.gameId = GlobalGameState.globalServerGame.id;
		this.name = name;
		this.type = type;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.time = performance.now();
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
		this.onResetEvent(x,y,dx,dy);
	}

	onResetEvent(x,y,dx,dy) {
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
