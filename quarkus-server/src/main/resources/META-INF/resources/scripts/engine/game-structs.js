// global letiables
let MAZE_WIDTH = 1024;
let MAZE_HEIGHT = 736;

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


class Player extends Renderable {
	constructor(x, y, speed) {
		super(x, y);
		this.speed = speed;
		this.image = new Image();
	}

	draw(ctx, renderer, camera) {
		if( super.draw(ctx, renderer, camera)) {
			ctx.drawImage(
				this.image,
				Math.floor((this.x - this.startX) * renderer.tileWidth + this.offsetX),
				Math.floor((this.y - this.startY) * renderer.tileHeight + this.offsetY),
				renderer.tileWidth,
				renderer.tileHeight
			);
		}
	}
}

/**
 * Enemy Object: Every enemy is represented by this class
 * It contains methods for calculating the next movement
 */
class Enemy extends Renderable {
	constructor(x, y, speed) {
		super(x, y);
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

		// allocate an array of booleans for the path finder
		this.discovered = new Array(renderer.mapHeight);
		for (let y = 0; y < renderer.mapHeight; y++) {
			this.discovered[y] = new Array(renderer.mapWidth);
			for (let x = 0; x < renderer.mapWidth; x++) {
				this.discovered[y][x] = false;
			}
		}
	}

	draw(ctx, renderer, camera) {
		this.x = this.catX;
		this.y = this.catY;
		if( super.draw(ctx, renderer, camera) ) {
			let xPos = Math.floor((this.catX - this.startX) * renderer.tileWidth + this.offsetX);
			let yPos = Math.floor((this.catY - this.startY) * renderer.tileHeight + this.offsetY);
			ctx.drawImage(this.image, xPos, yPos, renderer.tileWidth, renderer.tileHeight);
		}
	}

	/**
	 * Pathfinding for this enemy
	 * @param {*} renderer 
	 * @returns 
	 */
	calculateNextMove(renderer) {
		let mouseX = renderer.player.x;
		let mouseY = renderer.player.y;
		let dirs = [
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
			let catX = this.catX;
			let catY = this.catY;
		
			let queue = new Queue();

			// prepare discovered places
			let discovered = this.discovered;
			for (let y = 0; y < renderer.mapHeight; y++) {
				for (let x = 0; x < renderer.mapWidth; x++) {
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
			let currentTimeStamp = Date.now();
			if( (currentTimeStamp - this.stunnedTime) > 4000 ) {
				this.stunned = false;
			}
			return;
		}

		if( !this.nextPositionFound ) {
			let enemyWalked = false;
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
				for( let d = 0; d < dirs.length; d++) {
					let dir = dirs[d];
					if( renderer.isWalkable(this.catX + dir.dx, this.catY + dir.dy)) {
						this.currentWalkingDir = dir;
						this.catX += this.currentWalkingDir.dx;
						this.catY += this.currentWalkingDir.dy;
						if( dir.dx == -1 ) this.image = this.catLeft;
						else if( dir.dx == +1) this.image = this.catRight;

						break;
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
	constructor(mapWidth, mapHeight, canvasWidth, canvasHeight, tileWidth, tileHeight) {
		this.x = 0;
		this.y = 0;
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
		this.width = canvasWidth;
		this.height = canvasHeight;
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight
		this.maxX = mapWidth * tileWidth - canvasWidth;
		this.maxY = mapHeight * tileHeight - canvasHeight;
		this.SPEED = this.tileWidth/4;
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
		let posX = x * this.tileWidth;
		let posY = y * this.tileHeight;
		if (posX < this.x || posX > this.x + this.width || posY < this.y || posY > this.y + this.height) {
			return false;
		}
		return true;
	}

	centerAround(x, y) {
		let w = this.width / this.tileWidth;
		let h = this.height / this.tileHeight;

		this.x = (x - w / 2) * this.tileWidth;
		this.y = (y - h / 2) * this.tileHeight;

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
		let startX = Math.floor(this.camera.x / 32);
		let startY = Math.floor(this.camera.y / 32);
		let offsetX = -this.camera.x + startX * 32;
		let offsetY = -this.camera.y + startY * 32;

		ctx.drawImage(
			this.image,
			this.currentFrame * 32,
			32,
			32,
			32,
			Math.floor((x * this.camera.tileWidth) + offsetX),
			Math.floor((y * this.camera.tileHeight) + offsetY),
			this.camera.tileWidth,
			this.camera.tileHeight
		);

	}

	draw(ctx) {
		if( !this.exploded ) {
			let startX = Math.floor(this.camera.x / 32);
			let startY = Math.floor(this.camera.y / 32);
			let offsetX = -this.camera.x + startX * 32;
			let offsetY = -this.camera.y + startY * 32;

			if( this.currentFrame < animatedBomb.tiles[1].animation.length ) {
				// draw main part
				ctx.drawImage(
					this.image,
					this.currentFrame * this.camera.tileWidth,
					this.camera.tileHeight,
					this.camera.tileWidth,
					this.camera.tileHeight,
					Math.floor((this.x - startX) * this.camera.tileWidth + offsetX),
					Math.floor((this.y - startY) * this.camera.tileHeight + offsetY),
					this.camera.tileWidth,
					this.camera.tileHeight
				);

				ctx.drawImage(
					this.image,
					this.currentFrame * this.camera.tileWidth,
					0,
					this.camera.tileWidth,
					this.camera.tileHeight,
					Math.floor((this.x - startX) * this.camera.tileWidth + offsetX),
					Math.floor((this.y - 1 - startY) * this.camera.tileHeight + offsetY),
					this.camera.tileWidth,
					this.camera.tileHeight
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