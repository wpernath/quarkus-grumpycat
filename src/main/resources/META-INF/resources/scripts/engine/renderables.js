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
    constructor(pos) {

    }
}