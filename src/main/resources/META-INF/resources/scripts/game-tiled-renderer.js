// Bits on the far end of the 32-bit global tile ID are used for tile flags
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;

const BONUS_10PT = 963;
const BONUS_BOMB = 961;

const PLAYER_TILE = 993;
const ENEMY_TILE = 994;

const STONES = [
    510,
    511,
    575,
    576,
    607,
    608,
    183,
    184,
    4,
    7,
    479,
    640
];

class TiledMapRenderer {
	camera;
	enemies = [];
	player;
	mapData = null;
	mapWidth = 30;
	mapHeight = 30;
	tileWidth = 32;
	tileHeight = 32;
 
    // next 4 vars should be read from tileset
    tilesetColumns = 32;
    tilesetSpacing = 0;
    tilesetMargin = 0;
    tilesetWidth = 1024;
	layers = [];
	tileset = "";
	tilesetImage = new Image();
    bombImageSet = new Image();
    placedBombs = [];

	constructor() {}

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
		this.tileset = this.mapData.tilesets[0].source;

		// get all enemies and initialize player;
		let personLayer = this.getLayer("Persons");

		for (let i = 0; i < personLayer.data.length; i++) {
			let tile = personLayer.data[i];
			let x = i % this.mapWidth;
			let y = ~~(i / this.mapWidth);

			if (tile == PLAYER_TILE) {
				// player
				this.player = new Player(x, y, 1);
                this.camera = new Camera(this.mapWidth, this.mapHeight, MAZE_WIDTH, MAZE_HEIGHT);
                this.camera.centerAround(x, y);
                console.log("  player at(" + x + ", " + y + ")");

			} 
            else if (tile == ENEMY_TILE) {
				// enemy
				this.enemies.push(new Enemy(x, y, 3));
                console.log("  enemy at(" + x + ", " + y + ")");
			}
		}
	}

    countMaxScore() {
        let layer = this.getLayer("Bonus");
        let maxScore = 0;
        for( let t = 0; t < layer.data.length; t++ ) {
            let tile = layer.data[t];
            if(tile != 0) maxScore+=10;
        }
        return maxScore;
    }

    placeBomb(bomb) {
        let layer = this.getLayer("Persons");
        this.placedBombs.push(bomb);
    }

    placeBarrier(x, y) {
        let layer = this.getLayer("Frame");
        if( this.isWalkable(x,y)) {
            this.setTileAt(layer, x, y, Math.floor(Math.random() * STONES.length));
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

		for (let l = 0; l < this.layers.length; l++) {
			let layer = this.layers[l];
			if (layer.name != "Persons") {
				for (let y = startY; y < endY; y++) {
					for (let x = startX; x < endX; x++) {
						let xPos = Math.floor((x - startX) * this.tileWidth ) + offsetX;
						let yPos = Math.floor((y - startY) * this.tileHeight) + offsetY;

						let t = this.tileAt(layer, x, y);
						let tile = t & ~(FLIPPED_DIAGONALLY_FLAG | FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
                        let flippedHorizontally = (t & FLIPPED_HORIZONTALLY_FLAG) != 0 ? true : false;
                        let flippedVertically   = (t & FLIPPED_VERTICALLY_FLAG) != 0 ? true : false;
        
						if (tile != 0) {
                            tile -= 1;

                            // calculate position on tileset
                            let tileX= Math.floor(tile % this.tilesetColumns);
                            let tileY= Math.floor(tile / this.tilesetColumns);
                            let srcX = Math.floor((tileX * this.tileWidth) + (this.tilesetSpacing * (tileX)));
                            let srcY = Math.floor((tileY * this.tileHeight) + (this.tilesetMargin * (tileY)));
                            let w = this.tileWidth;
                            let h = this.tileHeight;
                            ctx.save();

                            if( flippedHorizontally || flippedVertically) {
                                ctx.scale(flippedVertically ? -1 : 1, flippedHorizontally ? -1 : 1);
                                if( flippedHorizontally ) yPos = (yPos + h) * -1;
                                if( flippedVertically )   xPos = (xPos + w) * -1;
                            }
                            ctx.drawImage(
                                this.tilesetImage, 
                                srcX, 
                                srcY, 
                                w, 
                                h, 
                                xPos, 
                                yPos, 
                                w, 
                                h
                            );
                            ctx.restore();
						}
					}
				}
			}
            else {
                // draw enemies and player
                for(let e = 0; e < this.enemies.length; e++ ) {
                    let enemy = this.enemies[e];
                    enemy.draw(ctx, this, this.camera);
                }

                // draw mouse
                this.player.draw(ctx, this, this.camera);

                // draw bombs
                let explodedBombs = [];
                for( let b = 0; b < this.placedBombs.length; b++) {
                    let bomb = this.placedBombs[b];
                    bomb.draw(ctx);     
                    if( bomb.exploded) {
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
                        for( let e=0; e < this.enemies.length; e++) {
                            let enemy = this.enemies[e];
                            if( bomb.x - 2 < enemy.catX && bomb.x + 2 > enemy.catX && bomb.y - 2 < enemy.catY && bomb.y + 2 > enemy.catY) {
                                if( !enemy.stunned ) {
                                    enemy.stunned = true;
                                    enemy.stunnedTime = Date.now();
                                }
                            }
                        }
                    }               
                }

                // remove exploded bombs from array
                for( let b = 0; b < explodedBombs.length; b++) {
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
        if( x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight) return false;

		let layer = this.getLayer("Frame");
		return this.tileAt(layer, x, y) == 0;
	}
}
