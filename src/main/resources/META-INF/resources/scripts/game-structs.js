// global variables
const MAZE_WIDTH = 1000;
const MAZE_HEIGHT = 800;

const TILE_WIDTH = 40;
const TILE_HEIGHT = 40;
const CAT_SPEED = 3;

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

class CatPos {
	constructor(x, y) {
		this.catX = x;
		this.catY = y;
	}
}

class Camera {
	constructor(map, canvasWidth, canvasHeight) {
		this.x = 0;
		this.y = 0;
		this.map = map;
		this.width = canvasWidth;
		this.height = canvasHeight;
		this.maxX = map.width * TILE_WIDTH - canvasWidth;
		this.maxY = map.height * TILE_HEIGHT - canvasHeight;
		this.SPEED = TILE_WIDTH;
	}
}

Camera.prototype.move = function(dirX, dirY) {
	this.x += dirX * this.SPEED;
	this.y += dirY * this.SPEED;

	// clip values
	this.x = Math.max(0, Math.min(this.x, this.maxX));
	this.y = Math.max(0, Math.min(this.y, this.maxY));
}

Camera.prototype.isInView = function(x, y) {
	var posX = x * TILE_WIDTH;
	var posY = y * TILE_HEIGHT;
	if( posX < this.x || posX > this.x + this.width || posY < this.y || posY > this.y + this.height) {
		return false;
	}
	return true;
}

Camera.prototype.centerAround = function(x, y) {
	var posX = x * TILE_WIDTH;
	var posY = y * TILE_HEIGHT;
	var w = this.width / TILE_WIDTH;
	var h = this.height / TILE_HEIGHT;

	this.x = (x - (w / 2)) * TILE_WIDTH ;
	this.y = (y - (h / 2)) * TILE_HEIGHT;	

	// clip values
	this.x = Math.max(0, Math.min(this.x, this.maxX));
	this.y = Math.max(0, Math.min(this.y, this.maxY));
}
