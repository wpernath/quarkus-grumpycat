class Renderable {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    draw(ctx, renderer, camera) {
        if (camera.isInView(this.x, this.y)) {
            this.startX = Math.floor(camera.x / renderer.tileWidth);
            this.startY = Math.floor(camera.y / renderer.tileHeight);
            this.offsetX = -camera.x + this.startX * renderer.tileWidth;
            this.offsetY = -camera.y + this.startY * renderer.tileHeight;
            return true;
        }
        return false;
    }
}


class Tile extends Renderable {
    // Bits on the far end of the 32-bit global tile ID are used for tile flags
    static FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    static FLIPPED_VERTICALLY_FLAG = 0x40000000;
    static FLIPPED_DIAGONALLY_FLAG = 0x20000000;
    static ROTATED_HEXAGONAL_120_FLAG = 0x10000000;

    tileId;
    tileset;
    mapWidth;
    mapHeight;
    skipTile = false;
    xPosOnTileSet = 0;
    yPosOnTileSet = 0;
    width;
    height;

    constructor(x, y, tileId, tileset, mapWidth, mapHeight) {
        super(x,y);             // the position on the map
        this.tileId = tileId; // the number of the tile, relative to the tileset
        this.tileset= tileset;   // tileset to be used     
        this.mapWidth = mapWidth; 
        this.mapHeight = mapHeight;
        this.width = tileset.tileWidth;
        this.height= tileset.tileHeight;

        this.skipTile = (tileId == 0);

        // demask flags
        let t = tileId & ~(FLIPPED_DIAGONALLY_FLAG | FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | ROTATED_HEXAGONAL_120_FLAG);
        this.flippedHorizontally = (tileId & FLIPPED_HORIZONTALLY_FLAG) != 0 ? true : false;
		this.flippedVertically = (tileId & FLIPPED_VERTICALLY_FLAG) != 0 ? true : false;

        this.tileId = t;
        if( t > 0 ) {
            this.tileId -= 0;
            this.xPosOnTileSet = Math.floor(tileId / tileset.columns) * tileset.tileWidth;
			this.yPosOnTileSet = Math.floor(tileId % tileset.columns) * tileset.tileHeight;
        }
        else {
            this.skipTile = true;
        }        
    }

    draw(ctx, ) {
        if( this.skipTile ) return;
        else {
            if( super.draw(ctx) ) {

            }
        }
    }
}