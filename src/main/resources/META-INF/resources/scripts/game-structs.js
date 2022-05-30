// global variables
const MAZE_WIDTH = 960;
const MAZE_HEIGHT = 640;

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const CAT_SPEED =5;

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
		this.stunned = false;
		this.stunnedTime = 0;
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
		this.SPEED = TILE_WIDTH/4;
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

		//console.log("Camera.pos = " + this.x + " / " + this.y + " ");
	}
}

class PlacedBomb {
	constructor(x, y, imageSet, camera ) {
		this.x = x;
		this.y = y;
		this.image = imageSet;
		this.camera = camera;
		this.exploded = false;
		this.timeToExplode = 3;
		this.currentFrame = 0;
	}

	explode(ctx, x, y) {
		var startX = Math.floor(this.camera.x / 32);
		var startY = Math.floor(this.camera.y / 32);
		var offsetX = -this.camera.x + startX * 32;
		var offsetY = -this.camera.y + startY * 32;

		ctx.drawImage(
			this.image,
			this.currentFrame * 32,
			32,
			32,
			32,
			Math.floor((x * TILE_WIDTH) + offsetX),
			Math.floor((y * TILE_HEIGHT) + offsetY),
			TILE_WIDTH,
			TILE_HEIGHT
		);

	}

	draw(ctx) {
		if( !this.exploded ) {
			var startX = Math.floor(this.camera.x / 32);
			var startY = Math.floor(this.camera.y / 32);
			var offsetX = -this.camera.x + startX * 32;
			var offsetY = -this.camera.y + startY * 32;

			if( this.currentFrame < animatedBomb.tiles[1].animation.length ) {
				// draw main part
				ctx.drawImage(
					this.image,
					this.currentFrame * 32 ,
					32,
					32,
					32,
					Math.floor((this.x - startX) * TILE_WIDTH + offsetX),
					Math.floor((this.y - startY) * TILE_HEIGHT + offsetY),
					TILE_WIDTH,
					TILE_HEIGHT
				);

				ctx.drawImage(
					this.image,
					this.currentFrame * 32,
					0,
					32,
					32,
					Math.floor((this.x - startX) * TILE_WIDTH + offsetX),
					Math.floor((this.y-1 - startY) * TILE_HEIGHT + offsetY),
					TILE_WIDTH,
					TILE_HEIGHT
				);

				if( this.currentFrame > 6 ) {
					this.explode(ctx, this.x -startX -1, this.y - startY -1);
					this.explode(ctx, this.x -startX, this.y-1-startY);
					this.explode(ctx, this.x+1-startX, this.y - 1-startY);

					this.explode(ctx, this.x - 1-startX, this.y - startY);
					this.explode(ctx, this.x + 1-startX, this.y-startY);

					this.explode(ctx, this.x - 1 - startX, this.y +1 -startY);
					this.explode(ctx, this.x - startX, this.y -startY+ 1);
					this.explode(ctx, this.x + 1 -startX, this.y + 1 -startY);
				}
				this.currentFrame++;
			}
			else {
				this.currentFrame = 0;
				this.exploded = true;
			}
		}
	}

}

const animatedBomb = {
	columns: 13,
	image: "../../../../../../../../Downloads/opengameart/BombExploding.png",
	imageheight: 64,
	imagewidth: 416,
	margin: 0,
	name: "bomb",
	spacing: 0,
	tilecount: 26,
	tiledversion: "1.8.5",
	tileheight: 32,
	tiles: [
		{
			animation: [
				{
					duration: 100,
					tileid: 0,
				},
				{
					duration: 100,
					tileid: 1,
				},
				{
					duration: 100,
					tileid: 2,
				},
				{
					duration: 100,
					tileid: 3,
				},
				{
					duration: 100,
					tileid: 4,
				},
				{
					duration: 100,
					tileid: 5,
				},
				{
					duration: 100,
					tileid: 6,
				},
				{
					duration: 100,
					tileid: 7,
				},
				{
					duration: 100,
					tileid: 8,
				},
				{
					duration: 100,
					tileid: 9,
				},
				{
					duration: 100,
					tileid: 10,
				},
				{
					duration: 100,
					tileid: 11,
				},
				{
					duration: 100,
					tileid: 12,
				},
			],
			id: 0,
		},
		{
			animation: [
				{
					duration: 100,
					tileid: 13,
				},
				{
					duration: 100,
					tileid: 14,
				},
				{
					duration: 100,
					tileid: 15,
				},
				{
					duration: 100,
					tileid: 16,
				},
				{
					duration: 100,
					tileid: 17,
				},
				{
					duration: 100,
					tileid: 18,
				},
				{
					duration: 100,
					tileid: 19,
				},
				{
					duration: 100,
					tileid: 20,
				},
				{
					duration: 100,
					tileid: 21,
				},
				{
					duration: 100,
					tileid: 22,
				},
				{
					duration: 100,
					tileid: 23,
				},
				{
					duration: 100,
					tileid: 24,
				},
				{
					duration: 100,
					tileid: 25,
				},
			],
			id: 13,
		},
	],
	tilewidth: 32,
	type: "tileset",
	version: "1.8",
};