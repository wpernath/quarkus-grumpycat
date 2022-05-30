// Bits on the far end of the 32-bit global tile ID are used for tile flags
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;

//const PLAYER_TILE=61;
//const ENEMY_TILE=62;

const BONUS_10PT = 963;
const BONUS_BOMB = 961;

const PLAYER_TILE = 993;
const ENEMY_TILE = 994;

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
		for (var i = 0; i < this.layers.length; i++) {
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
		var personLayer = this.getLayer("Persons");

		for (var i = 0; i < personLayer.data.length; i++) {
			var tile = personLayer.data[i];
			var x = i % this.mapWidth;
			var y = ~~(i / this.mapWidth);

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
        var layer = this.getLayer("Bonus");
        var maxScore = 0;
        for( var t = 0; t < layer.data.length; t++ ) {
            var tile = layer.data[t];
            if(tile != 0) maxScore+=10;
        }
        return maxScore;
    }

    placeBomb(bomb) {
        var layer = this.getLayer("Persons");
        this.placedBombs.push(bomb);
    }

	draw(ctx) {
		var startX = Math.floor(this.camera.x / this.tileWidth);
		var endX = startX + this.camera.width / this.tileWidth;
		var startY = Math.floor(this.camera.y / this.tileHeight);
		var endY = startY + this.camera.height / this.tileHeight;
		var offsetX = -this.camera.x + startX * this.tileWidth;
		var offsetY = -this.camera.y + startY * this.tileHeight;

		for (var l = 0; l < this.layers.length; l++) {
			var layer = this.layers[l];
			if (layer.name != "Persons") {
				for (var y = startY; y < endY; y++) {
					for (var x = startX; x < endX; x++) {
						var xPos = Math.floor((x - startX) * this.tileWidth ) + offsetX;
						var yPos = Math.floor((y - startY) * this.tileHeight) + offsetY;

						var t = this.tileAt(layer, x, y);
						var tile = t & ~(FLIPPED_DIAGONALLY_FLAG | FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
                        var flippedHorizontally = (t & FLIPPED_HORIZONTALLY_FLAG) != 0 ? true : false;
                        var flippedVertically   = (t & FLIPPED_VERTICALLY_FLAG) != 0 ? true : false;
        
						if (tile != 0) {
                            tile -= 1;

                            // calculate position on tileset
                            var tileX= Math.floor(tile % this.tilesetColumns);
                            var tileY= Math.floor(tile / this.tilesetColumns);
                            var srcX = Math.floor((tileX * this.tileWidth) + (this.tilesetSpacing * (tileX)));
                            var srcY = Math.floor((tileY * this.tileHeight) + (this.tilesetMargin * (tileY)));
                            var w = this.tileWidth;
                            var h = this.tileHeight;
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
                for(var e = 0; e < this.enemies.length; e++ ) {
                    var enemy = this.enemies[e];

                    if (camera.isInView(enemy.catX, enemy.catY)) {
                        var xPos = Math.floor((enemy.catX - startX) * TILE_WIDTH + offsetX);
                        var yPos = Math.floor((enemy.catY - startY) * TILE_HEIGHT + offsetY);


                        ctx.drawImage(enemy.image, xPos, yPos, TILE_WIDTH, TILE_WIDTH);
                        //console.log("enemy " + e + " is in range of cam. Pos (" + xPos + "/" + yPos);
                    }
                    else {
                        //console.log("enemy " + e + " is not within camera (" + enemy.catX + "/" + enemy.catY+ ")");
                    }
                }

                // draw mouse
                ctx.drawImage(
                    this.player.image, 
                    Math.floor((this.player.x - startX) * TILE_WIDTH + offsetX), 
                    Math.floor((this.player.y - startY) * TILE_HEIGHT + offsetY), 
                    TILE_WIDTH, 
                    TILE_HEIGHT
                );

                // draw bombs
                var explodedBombs = [];
                for( var b = 0; b < this.placedBombs.length; b++) {
                    var bomb = this.placedBombs[b];
                    bomb.draw(ctx);     
                    if( bomb.exploded) {
                        explodedBombs.push(b);
                        var frame = this.getLayer("Frame");
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
                        for( var e=0; e < this.enemies.length; e++) {
                            var enemy = this.enemies[e];
                            if( bomb.x - 2 < enemy.catX && bomb.x + 2 > enemy.catX && bomb.y - 2 < enemy.catY && bomb.y + 2 > enemy.catY) {
                                if( !enemy.stunned ) {
                                    enemy.stunned = true;
                                    enemy.stunnedTime = Date.now();
                                    console.log("enemy stunned for 3 sec");
                                }
                            }
                        }
                    }               
                }

                // remove exploded bombs from array
                for( var b = 0; b < explodedBombs.length; b++) {
                    this.placedBombs.splice(explodedBombs[b], 1);
                }
		    }
		}
	}

	checkForBonus(x, y) {
		var layer = this.getLayer("Bonus");
		var tile = this.tileAt(layer, x, y);
		if (tile == 0) return 0;
		else {
			this.setTileAt(layer, x, y, 0);
			return tile;
		}
	}

	setTileAt(layer, x, y, newSet) {
        if (x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
    		var pos = y * this.mapWidth + x;
	    	layer.data[pos] = newSet;
        }
	}

	tileAt(layer, x, y) {
		var pos = y * this.mapWidth + x;
		return layer.data[pos];
	}

	isWalkable(x, y) {
        if( x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight) return false;

		var layer = this.getLayer("Frame");
		return this.tileAt(layer, x, y) == 0;
	}
}
