import { collision, Entity, level, Rect, Sprite, Body, Vector2d } from "melonjs/dist/melonjs.module.js";
import { EnemyAction } from "../util/game-updates";
import GlobalGameState from "../util/global-game-state";
import NetworkManager from "../util/network";

export class Direction {
	constructor(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	}
}

export class Node {
	constructor(x, y, dir) {
		this.x = x;
		this.y = y;
		this.initialDir = dir;
	}
}

export class Queue {
	constructor() {
		this.elements = {};
		this.head = 0;
		this.tail = 0;
	}
	enqueue(element) {
		this.elements[this.tail] = element;
		this.tail++;
	}
	dequeue() {
		const item = this.elements[this.head];
		delete this.elements[this.head];
		this.head++;
		return item;
	}
	peek() {
		return this.elements[this.head];
	}
	get length() {
		return this.tail - this.head;
	}
	get isEmpty() {
		return this.length === 0;
	}
	clear() {
		this.elements = {};
		this.head = 0;
		this.tail = 0;
	}
}

const DIRS_NO_DIAGONAL = [
			new Direction(-1, 0),
			new Direction(0, -1),
			new Direction(0, +1),
			new Direction(+1, 0),
];

const DIRS = [
			new Direction(-1, 0),
			new Direction(0, -1),
			new Direction(0, +1),
			new Direction(+1, 0),
			new Direction(-1, -1),
			new Direction(+1, +1),
			new Direction(+1, -1),
			new Direction(-1, +1),
		];

export const ENEMY_TYPES = {
	cat: 'CAT',
	spider: 'SPIDER',
	golem: 'GOLEM',
};

export class BaseEnemySprite extends Sprite {
	borderLayer;
	discoveredPlaces = [];
	nextPositionFound = false;
	player;
	mapWidth;
	mapHeight;
	isDead = false;
	isStunned = false;
	enemyType = ENEMY_TYPES.cat;
	enemyCanWalkDiagonally = true;
	enemyName = "";
	nextPosition = new EnemyAction(this.name, this.enemyType);


	constructor(x, y, settings) {
		super(x * 32 - (settings.width / 2), y * 32 - (settings.height / 2), {
			width: settings.width || 32,
			height: settings.height || 32,
			image: settings.image,
			framewidth: settings.framewidth || 32,
			frameheight: settings.frameheight || 32,
			anchorPoint: new Vector2d(0,0),
		});

		let layers = level.getCurrentLevel().getLayers();
		this.mapWidth = level.getCurrentLevel().cols;
		this.mapHeight = level.getCurrentLevel().rows;
        
		layers.forEach((l) => {
			if (l.name === "Frame") this.borderLayer = l;
		});
		// allocate an array of booleans for the path finder
		this.discoveredPlaces = new Array(this.mapHeight);

		for (let y = 0; y < this.mapHeight; y++) {
			this.discoveredPlaces[y] = new Array(this.mapWidth);
			for (let x = 0; x < this.mapWidth; x++) {
				this.discoveredPlaces[y][x] = false;
			}
		}

		this.alwaysUpdate = true;
		this.body = new Body(this);
		this.body.addShape(new Rect(0, 0, this.width, this.height));
		this.body.ignoreGravity = true;
		this.body.collisionType = collision.types.ENEMY_OBJECT;
		this.body.setCollisionMask(collision.types.PLAYER_OBJECT | collision.types.PROJECTILE_OBJECT);
	}


	setEnemyName(name) {
		this.name = name;
		this.nextPosition.name = name;
		this.enemyName = name;
	}

	/**
	 * Needs to be overwritten by children of BaseEnemy. Implement it as needed.
	 * @param {*} dt 
	 */
	updatePosition(dt) {
	}

	/**
	 * Base 
	 * @param {*} dt 
	 */
	update(dt) {
		this.updatePosition(dt);
		super.update(dt);
	}


	calculateNextPosition(dt) {
		let playerPos = this.transformPosition(this.player.pos.x, this.player.pos.y);
		let playerX = playerPos.x;
		let playerY = playerPos.y;
		let myPos = this.transformPosition(this.pos.x, this.pos.y);
		let posX = myPos.x;
		let posY = myPos.y;
        let dirs = DIRS;
		let queue = new Queue();
		let discovered = this.discoveredPlaces;

		//this.nextPosition = new EnemyAction(this.name, this.enemyType);
		this.nextPosition.hasChanged = true;
		this.nextPositionFound = false;
		
		if( this.enemyCanWalkDiagonally ) {
			dirs = DIRS;
		}
		else {
			dirs = DIRS_NO_DIAGONAL;
		}
		
		// prepare discovered places
		for (let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				discovered[y][x] = false;
			}
		}

		// mark the current pos as visited
		discovered[posY][posX] = true;

		queue.enqueue(new Node(posX, posY, null));
		while (!queue.isEmpty) {
			let node = queue.dequeue();

			for (let d = 0; d < dirs.length; d++) {
				let dir = dirs[d];
				let newX = node.x + dir.dx;
				let newY = node.y + dir.dy;
				let newDir = node.initialDir == null ? dir : node.initialDir;

				// found mouse
				if (newX == playerX && newY == playerY) {
					posX = posX + newDir.dx;
					posY = posY + newDir.dy;

					queue.clear();
					this.nextPosition.last.dx = this.nextPosition.dx;
					this.nextPosition.last.dy = this.nextPosition.dy;
					this.nextPositionFound = true;
					this.nextPosition.x = posX;
					this.nextPosition.y = posY;
					this.nextPosition.dx = newDir.dx;
					this.nextPosition.dy = newDir.dy;
					break;
				}				

				if (this.isWalkable(newX, newY) && !discovered[newY][newX]) {
					discovered[newY][newX] = true;
					queue.enqueue(new Node(newX, newY, newDir));
				}
			}
		}
        if( !this.nextPositionFound ) {
			// try to find a new position without the need of a direct way to the player
        }
	}

	setPlayer(player) {
		this.player = player;
	}

	isWalkable(x, y) {
        if( x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight ) {
            return false;
        }
		let tile = this.borderLayer.cellAt(x, y);
		if (tile !== null) return false;
		else return true;
	}

	transformPosition(x, y) {
		return {
			x: Math.floor(x / 32),
			y: Math.floor(y / 32),
		};
	}

	getEnemyAction() {
		return this.nextPosition;
	}
}
