import { Container, RoundRect } from "melonjs";

/**
 * A simple container which fills with transparent background and a 
 * Border
 */
export class BaseContainer extends Container {
    /**
     * 
     * @param {number} x xpos of the container
     * @param {number} y ypos of the container
     * @param {number} w width of the container
     * @param {number} h height of the container
     * @param {*} options 
     */
	constructor(x, y, w, h, options) {
		super(x, y, w, h);
        this.clipping = true;

		this.border = new RoundRect(x, y, w, h);
	}

	draw(renderer, viewport) {
		renderer.setGlobalAlpha(0.3);
		renderer.setColor("#008800");
		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor("#000000");
		renderer.stroke(this.border);
		super.draw(renderer, viewport);
	}
}
