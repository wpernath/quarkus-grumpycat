// global variables
const MAZE_WIDTH = 1024;
const MAZE_HEIGHT = 736;

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


class Player {
	constructor(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.image = new Image();
	}
}

/**
 * Enemy Object: Every enemy is represented by this class
 */
class Enemy {
	constructor(x, y, speed) {
		this.catX = x;
		this.catY = y;
		this.speed = speed;
		this.image = new Image();
		this.catLeft = this.image;
		this.catRight = this.image;
		this.stunned = false;
		this.stunnedTime = 0;
		this.nextPositionFound = false;
		this.currentWalkingDir = null;
	}

	calculateNextMove(renderer) {
		var mouseX = renderer.player.x;
		var mouseY = renderer.player.y;
		var dirs = [
			new Direction(-1, 0),
			new Direction(0, -1),
			new Direction(0, +1),
			new Direction(+1, 0),
			new Direction(-1, -1),
			new Direction(+1, +1),
			new Direction(+1, -1),
			new Direction(-1, +1),
		];

		this.nextPositionFound = false;
		if(!this.stunned ) {
			var catX = this.catX;
			var catY = this.catY;
		
			var queue = new Queue();

			// prepare discovered places
			var discovered = new Array(renderer.mapHeight);
			for (var y = 0; y < renderer.mapHeight; y++) {
				discovered[y] = new Array(renderer.mapWidth);
				for (var x = 0; x < renderer.mapWidth; x++) {
					discovered[y][x] = false;
				}
			}
			// mark the current pos as visited
			discovered[catY][catX] = true;

			queue.enqueue(new Node(catX, catY, null));
			while (!queue.isEmpty) {
				var node = queue.dequeue();

				for (var d = 0; d < dirs.length; d++) {
					var dir = dirs[d];
					var newX = node.x + dir.dx;
					var newY = node.y + dir.dy;
					var newDir = node.initialDir == null ? dir : node.initialDir;

					// found mouse
					if (newX == mouseX && newY == mouseY) {
						catX = catX + newDir.dx;
						catY = catY + newDir.dy;

						this.catX = catX;
						this.catY = catY;
						if( newDir.dx < 0 )    this.image=this.catLeft;
						else if( newDir.dx > 0)this.image=this.catRight;

						queue = new Queue();
						this.nextPositionFound = true;
						break;
					}

					if (renderer.isWalkable(newX, newY) && !discovered[newY][newX]) {
						discovered[newY][newX] = true;
						queue.enqueue(new Node(newX, newY, newDir));
					}
				}
			}
		}
		else { // stunned
			var currentTimeStamp = Date.now();
			if( (currentTimeStamp - this.stunnedTime) > 4000 ) {
				this.stunned = false;
			}
			return;
		}

		if( !this.nextPositionFound ) {
			var enemyWalked = false;
			// just walk along a direction until cat reaches a border, then change to the 
			// next possible direction and walk along that
			if( this.currentWalkingDir != null ) {
				if( renderer.isWalkable(this.catX + this.currentWalkingDir.dx, this.catY + this.currentWalkingDir.dy)) {
					this.catX += this.currentWalkingDir.dx;
					this.catY += this.currentWalkingDir.dy;
					enemyWalked = true;
				}
			}
			if( !enemyWalked ) {
				for( var d = 0; d < dirs.length; d++) {
					var dir = dirs[d];
					if( renderer.isWalkable(this.catX + dir.dx, this.catY + dir.dy)) {
						this.currentWalkingDir = dir;
						this.catX += this.currentWalkingDir.dx;
						this.catY += this.currentWalkingDir.dy;
					}
				}
			}
		}

	}

}

/**
 * Camera Object: This is used to display the current part of the map
 * The player is always in the center of the cam (if possible)
 */
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