// Bits on the far end of the 32-bit global tile ID are used for tile flags
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;

class TiledMapRenderer {
	camera;
	enemies = [];
	player;
	mapData = null;
	mapWidth = 30;
	mapHeight = 30;
	tileWidth = 32;
	tileHeight = 32;

    // next 3 vars should be read from tileset
    tilesetColumns = 11;
    tilesetSpacing = 1;
    tilesetMargin = 1;
    tilesetWidth = 363;
	layers = [];
	tileset = "";
	tilesetImage = new Image();

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

			if (tile == 61) {
				// player
				this.player = new Player(x, y, 1);
                this.camera = new Camera(this.mapWidth, this.mapHeight, MAZE_WIDTH, MAZE_HEIGHT);
                this.camera.centerAround(x, y);
                console.log("  player at(" + x + ", " + y + ")");

			} 
            else if (tile == 64) {
				// enemy
				this.enemies.push(new Enemy(x, y, 3));
                console.log("  enemy at(" + x + ", " + y + ")");
			}
		}
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
						var xPos = Math.round((x - startX) * this.tileWidth );
						var yPos = Math.round((y - startY) * this.tileHeight);

						var t = this.tileAt(layer, x, y);
						var tile = t & ~(FLIPPED_DIAGONALLY_FLAG | FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
                        var flippedHorizontally = (t & FLIPPED_HORIZONTALLY_FLAG) != 0 ? true : false;
                        var flippedVertically   = (t & FLIPPED_VERTICALLY_FLAG) != 0 ? true : false;
        
						if (tile != 0) {
                            tile -= 1;
                            if( tile > 100 || tile < 0 )  {
                                console.log("  wrong tile at (" + x + ", " + y + ")");
                            }
                            // calculate position on tileset
                            if( tile == 12) {
                                console.log("tile == 13")
                            }
                            var tileX= Math.round(tile % this.tilesetColumns);
                            var tileY= Math.round(tile / this.tilesetColumns);
                            var srcX = Math.round((tileX * this.tileWidth) + (this.tilesetSpacing * (tileX)));
                            var srcY = Math.round((tileY * this.tileHeight) + (this.tilesetMargin * (tileY)));
                            var w = this.tileWidth;
                            var h = this.tileHeight;
                            ctx.save();

                            if( flippedHorizontally || flippedVertically) {
                                //ctx.scale(flippedVertically ? -1 : 0, flippedHorizontally ? -1 : 0);
                                //if( flippedHorizontally ) srcY *= -1;
                                //if( flippedVertically )   srcX *= -1;
                                //console.log("flipped: " + flippedHorizontally + " / " + flippedVertically);
                            }
                            ctx.drawImage(
                                this.tilesetImage, 
                                srcX, 
                                srcY, 
                                w, 
                                h, 
                                xPos, 
                                yPos, 
                                this.tileWidth, 
                                this.tileHeight
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
                        var xPos = Math.round((enemy.catX - startX) * TILE_WIDTH + offsetX);
                        var yPos = Math.round((enemy.catY - startY) * TILE_HEIGHT + offsetY);

                        ctx.drawImage(enemy.image, xPos, yPos, TILE_WIDTH, TILE_WIDTH);
                    }
                }

                // draw mouse
                ctx.drawImage(
                    this.player.image, 
                    Math.round((this.player.x - startX) * TILE_WIDTH + offsetX), 
                    Math.round((this.player.y - startY) * TILE_HEIGHT + offsetY), 
                    TILE_WIDTH, 
                    TILE_HEIGHT
                );
		    }
		}
	}

	checkPositionVisitedAndChange(x, y) {
		var layer = this.getLayer("Bonus");
		var tile = this.tileAt(layer, x, y);
		if (tile == 0) return true;
		else {
			this.setTileAt(layer, x, y, 0);
			return false;
		}
	}

	setTileAt(layer, x, y, newSet) {
		var pos = y * this.mapWidth + x;
		layer.data[pos] = newSet;
	}

	tileAt(layer, x, y) {
		var pos = y * this.mapWidth + x;
		return layer.data[pos];
	}

	isWalkable(x, y) {
		var layer = this.getLayer("Frame");
		return this.tileAt(layer, x, y) == 0;
	}
}
