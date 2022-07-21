import { collision, Entity, level, Rect, Sprite, Body } from "melonjs/dist/melonjs.module.js";
import GlobalGameState from "../util/global-game-state";

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

	nextPosition = {
		x: -1,
		y: -1,
		dx: 0,
		dy: 0,
		last: {
			dx: 0,
			dy: 0
		},
        toString : function() {
            return "[" + this.x + ", " + this.y + ", " + this.dx + ", " + this.dy + "]";
        }
	};

	constructor(x, y, w, h, img) {
		super(x * 32 - (w / 2), y * 32 - (h / 2), {
			width: w,
			height: h,
			image: img,
			framewidth: w,
			frameheight: h
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

	calculateNextPosition() {
		let mouse = this.transformPosition(this.player.pos.x, this.player.pos.y);
		let mouseX = mouse.x;
		let mouseY = mouse.y;
		let cat = this.transformPosition(this.pos.x, this.pos.y);
		let catX = cat.x;
		let catY = cat.y;
        let dirs = DIRS;
		let queue = new Queue();
		let discovered = this.discoveredPlaces;

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
		discovered[catY][catX] = true;

		queue.enqueue(new Node(catX, catY, null));
		while (!queue.isEmpty) {
			let node = queue.dequeue();

			for (let d = 0; d < dirs.length; d++) {
				let dir = dirs[d];
				let newX = node.x + dir.dx;
				let newY = node.y + dir.dy;
				let newDir = node.initialDir == null ? dir : node.initialDir;

				// found mouse
				if (newX == mouseX && newY == mouseY) {
					catX = catX + newDir.dx;
					catY = catY + newDir.dy;

					this.catX = catX;
					this.catY = catY;

					queue.clear();
					this.nextPosition.last.dx = this.nextPosition.dx;
					this.nextPosition.last.dy = this.nextPosition.dy;
					this.nextPositionFound = true;
					this.nextPosition.x = this.catX;
					this.nextPosition.y = this.catY;
					this.nextPosition.dx = newDir.dx * this.SPEED;
					this.nextPosition.dy = newDir.dy * this.SPEED;
					break;
				}				

				if (this.isWalkable(newX, newY) && !discovered[newY][newX]) {
					discovered[newY][newX] = true;
					queue.enqueue(new Node(newX, newY, newDir));
				}
			}
		}
        if( !this.nextPositionFound ) {
            
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
}
