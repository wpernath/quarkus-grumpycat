const BONUS_10PT = 963;
const BONUS_BOMB = 961;
const PLAYER_TILE = 993;
const ENEMY_TILE = 994;
const STONES = [182, 183, 184];

class TiledAnimFrame {
    id;
    duration;

    constructor(tileid, duration) {
        this.id = tileid;
        this.duration = duration;
    }
}

class TiledAnimation {
	id;
	frames = [];
	currentFrameId = 0;
	lastRequest = 0;

	constructor(id) {
		this.id = id;
	}

	addFrames(animFrames) {
		for (var a = 0; a < animFrames.length; a++) {
			this.frames.push(new TiledAnimFrame(animFrames[a].tileid, animFrames[a].duration));
		}
		this.currentFrameId = 0;
	}

	getNextTile(currentTime) {
		let elapsed = currentTime - this.lastRequest;
		let currentFrame = this.frames[this.currentFrameId];
		if (elapsed > currentFrame.duration) {
			this.lastRequest = currentTime;
			if (this.currentFrameId < this.frames.length - 1) {
				this.currentFrameId += 1;
				return this.frames[this.currentFrameId];
			} else {
				this.currentFrameId = 0;
				return this.frames[this.currentFrameId];
			}
		}
		return currentFrame;
	}
}

class TiledMapRenderer {
	camera;
	enemies = [];
	player;
	mapData = null;
	mapWidth = 30;
	mapHeight = 30;
	tileWidth = 32;
	tileHeight = 32;

	// next vars are read from tileset
	tileset;
	tilesetColumns = 32;
	tilesetSpacing = 0;
	tilesetMargin = 0;
	tilesetWidth = 1024;
	layers = [];

	tilesetImage = new Image();
	placedBombs = [];
	
	// for animation
	tileAnimations = [];

	constructor(canvas) {
		this.canvas = canvas;
		this.context= canvas.getContext('2d');
	}

	/**
	 *
	 * @param {String} name
	 * @returns
	 */
	getLayer(name) {
		for (let i = 0; i < this.layers.length; i++) {
			if (this.layers[i].name == name) {
				return this.layers[i];
			}
		}
		return null;
	}

	parse(json) {
		this.mapData = json;
		this.mapWidth = this.mapData.width;
		this.mapHeight = this.mapData.height;
		this.tileWidth = this.mapData.tilewidth;
		this.tileHeight = this.mapData.tileheight;
		this.layers = this.mapData.layers;
		this.tileset = this.mapData.tilesets[0];

		// prepare tileset parameters
		this.tilesetColumns = this.tileset.columns;
		this.tilesetSpacing = this.tileset.spacing;
		this.tilesetMargin = this.tileset.margin;
		this.tilesetWidth = this.tileset.imagewidth;

		// load tileset image
		this.tilesetImage.src = this.tileset.image;

		// get all enemies and initialize player;
		let personLayer = this.getLayer("Persons");

		for (let i = 0; i < personLayer.data.length; i++) {
			let tile = personLayer.data[i];
			let x = i % this.mapWidth;
			let y = ~~(i / this.mapWidth);

			if (tile == PLAYER_TILE) {
				// player
				this.player = new Player(x, y, 1);
				this.camera = new Camera(this.mapWidth, this.mapHeight, this.canvas.width, this.canvas.height, this.tileWidth, this.tileHeight);
				this.camera.centerAround(x, y);
				console.log("  player at(" + x + ", " + y + ")");
			} else if (tile == ENEMY_TILE) {
				// enemy
				this.enemies.push(new Enemy(x, y, 3));
				console.log("  enemy at(" + x + ", " + y + ")");
			}
		}

		// parse animation data per tile
		if (this.tileset.tiles !== null) {
			for (let t = 0; t < this.tileset.tiles.length; t++) {
				let tile = this.tileset.tiles[t];
				let tileanim = new TiledAnimation(tile.id);
				tileanim.addFrames(tile.animation);
				this.tileAnimations.push(tileanim);
				console.log(tileanim);
			}
		}
	}

	countMaxScore() {
		let layer = this.getLayer("Bonus");
		let maxScore = 0;
		for (let t = 0; t < layer.data.length; t++) {
			let tile = layer.data[t];
			if (tile != 0) maxScore += 10;
		}
		return maxScore;
	}

	placeBomb(bomb) {
		this.placedBombs.push(bomb);
	}

	placeBarrier(x, y) {
		let layer = this.getLayer("Frame");
		if (this.isWalkable(x, y)) {
			let stone = 182;
			let tile = this.tileAt(this.getLayer("Ground"), x, y);

			// check to see if ground is something light to get the dark stone etc.
			if (tile == 161) stone = 184;
			this.setTileAt(layer, x, y, stone);
			return true;
		}
		return false;
	}

	draw(ctx) {
		let startX = Math.floor(this.camera.x / this.tileWidth);
		let endX = startX + this.camera.width / this.tileWidth;
		let startY = Math.floor(this.camera.y / this.tileHeight);
		let endY = startY + this.camera.height / this.tileHeight;
		let offsetX = -this.camera.x + startX * this.tileWidth;
		let offsetY = -this.camera.y + startY * this.tileHeight;
		let currentTime = performance.now();

		for (let l = 0; l < this.layers.length; l++) {
			let layer = this.layers[l];
			if (layer.name != "Persons") {
				for (let y = startY; y < endY; y++) {
					for (let x = startX; x < endX; x++) {
						let xPos = Math.floor((x - startX) * this.tileWidth) + offsetX;
						let yPos = Math.floor((y - startY) * this.tileHeight) + offsetY;

						let t = this.tileAt(layer, x, y);
						let tile = t & ~(Tile.FLIPPED_DIAGONALLY_FLAG | Tile.FLIPPED_HORIZONTALLY_FLAG | Tile.FLIPPED_VERTICALLY_FLAG | Tile.ROTATED_HEXAGONAL_120_FLAG);
						let flippedHorizontally = (t & Tile.FLIPPED_HORIZONTALLY_FLAG) != 0 ? true : false;
						let flippedVertically = (t & Tile.FLIPPED_VERTICALLY_FLAG) != 0 ? true : false;

						if (tile != 0) {
							tile -= 1;

							// check to see if this is an animated tile
							for (var a = 0; a < this.tileAnimations.length; a++) {
								let animatedTile = this.tileAnimations[a];
								if (animatedTile.id == tile) {
									let frame = animatedTile.getNextTile(currentTime);
									tile = frame.id;
									break;
								}
							}

							// calculate position on tileset
							let tileX = Math.floor(tile % this.tilesetColumns);
							let tileY = Math.floor(tile / this.tilesetColumns);
							let srcX = Math.floor(tileX * this.tileWidth + this.tilesetSpacing * tileX);
							let srcY = Math.floor(tileY * this.tileHeight + this.tilesetMargin * tileY);
							let w = this.tileWidth;
							let h = this.tileHeight;
							ctx.save();

							if (flippedHorizontally || flippedVertically) {
								ctx.scale(flippedVertically ? -1 : 1, flippedHorizontally ? -1 : 1);
								if (flippedHorizontally) yPos = (yPos + h) * -1;
								if (flippedVertically) xPos = (xPos + w) * -1;
							}

							ctx.drawImage(this.tilesetImage, srcX, srcY, w, h, xPos, yPos, w, h);

							ctx.restore();
						}
					}
				}
			} else {
				// draw enemies and player
				for (let e = 0; e < this.enemies.length; e++) {
					let enemy = this.enemies[e];
					enemy.draw(ctx, this, this.camera);
				}

				// draw mouse
				this.player.draw(ctx, this, this.camera);

				// draw bombs
				let explodedBombs = [];
				for (let b = 0; b < this.placedBombs.length; b++) {
					let bomb = this.placedBombs[b];
					bomb.draw(ctx);
					if (bomb.exploded) {
						explodedBombs.push(b);

						// destroy borders in a 3x3 tile section around bomb
						let frame = this.getLayer("Frame");
						this.setTileAt(frame, bomb.x + 0, bomb.y, 0);
						this.setTileAt(frame, bomb.x - 1, bomb.y, 0);
						this.setTileAt(frame, bomb.x + 1, bomb.y, 0);

						this.setTileAt(frame, bomb.x + 0, bomb.y + 1, 0);
						this.setTileAt(frame, bomb.x - 1, bomb.y + 1, 0);
						this.setTileAt(frame, bomb.x + 1, bomb.y + 1, 0);

						this.setTileAt(frame, bomb.x + 0, bomb.y - 1, 0);
						this.setTileAt(frame, bomb.x - 1, bomb.y - 1, 0);
						this.setTileAt(frame, bomb.x + 1, bomb.y - 1, 0);

						// was an enemy in radius?
						for (let e = 0; e < this.enemies.length; e++) {
							let enemy = this.enemies[e];
							if (bomb.x - 2 < enemy.catX && bomb.x + 2 > enemy.catX && bomb.y - 2 < enemy.catY && bomb.y + 2 > enemy.catY) {
								if (!enemy.stunned) {
									enemy.stunned = true;
									enemy.stunnedTime = performance.now();
								}
							}
						}
					}
				}

				// remove exploded bombs from array
				for (let b = 0; b < explodedBombs.length; b++) {
					this.placedBombs.splice(explodedBombs[b], 1);
				}
			}
		}
	}

	checkForBonus(x, y) {
		let layer = this.getLayer("Bonus");
		let tile = this.tileAt(layer, x, y);
		if (tile == 0) return 0;
		else {
			this.setTileAt(layer, x, y, 0);
			return tile;
		}
	}

	setTileAt(layer, x, y, newSet) {
		if (x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
			let pos = y * this.mapWidth + x;
			layer.data[pos] = newSet;
		}
	}

	tileAt(layer, x, y) {
		let pos = y * this.mapWidth + x;
		return layer.data[pos];
	}

	isWalkable(x, y) {
		if (x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight) return false;

		let layer = this.getLayer("Frame");
		return this.tileAt(layer, x, y) == 0;
	}
}
