// global variables
const MAZE_WIDTH = 960;
const MAZE_HEIGHT = 640;

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const CAT_SPEED =4;

class Direction {
	constructor(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	}
}
 
class Node {
	constructor(x, y, dir) {
		this.x = x;
		this.y = y;
		this.initialDir = dir;
	}
}

class Queue {
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
}


/**
 * 
 */
class GameWorld {
	constructor(context, map, enemies, player, camera, canvasWidth, canvasHeight) {
		this.context = context;
		this.map=map;
		this.enemies = enemies;
		this.player = player;
		this.camera = camera;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
	}
}



class Player {
	constructor(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.image = new Image();
	}
}

class Enemy {
	constructor(x, y, speed) {
		this.catX = x;
		this.catY = y;
		this.speed = speed;
		this.image = new Image();
	}
}

class Camera {
	constructor(mapWidth, mapHeight, canvasWidth, canvasHeight) {
		this.x = 0;
		this.y = 0;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.width = canvasWidth;
		this.height = canvasHeight;
		this.maxX = mapWidth * TILE_WIDTH - canvasWidth;
		this.maxY = mapHeight * TILE_HEIGHT - canvasHeight;
		this.SPEED = TILE_WIDTH;
		this.centerAround(0,0);
	}

	move(dirX, dirY) {
		this.x += dirX * this.SPEED;
		this.y += dirY * this.SPEED;

		// clip values
		this.x = Math.max(0, Math.min(this.x, this.maxX));
		this.y = Math.max(0, Math.min(this.y, this.maxY));
	}

	isInView(x, y) {
		var posX = x * TILE_WIDTH;
		var posY = y * TILE_HEIGHT;
		if (posX < this.x || posX > this.x + this.width || posY < this.y || posY > this.y + this.height) {
			return false;
		}
		return true;
	}

	centerAround(x, y) {
		var w = this.width / TILE_WIDTH;
		var h = this.height / TILE_HEIGHT;

		this.x = (x - w / 2) * TILE_WIDTH;
		this.y = (y - h / 2) * TILE_HEIGHT;

		// clip values
		this.x = Math.max(0, Math.min(this.x, this.maxX));
		this.y = Math.max(0, Math.min(this.y, this.maxY));

		console.log("Camera.pos = " + this.x + " / " + this.y + " ");
	}
}


class TiledMapLayer {
	constructor(layerData, width, height) {
		this.layerData = layerData;
		this.width = width;
		this.height = height;
	}
}
class TiledMap {
	constructor() {
		
		this.layers = undefined;


	}
}