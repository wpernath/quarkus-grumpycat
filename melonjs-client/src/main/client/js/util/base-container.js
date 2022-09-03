import { Color, Container, RoundRect, Rect, BitmapText, Vector2d } from "melonjs";

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
	 * @param {string} [options.titleFont] Name of the bitmap font for drawing title
	 * @param {string} [options.titleText] title text
	 * @param {Color}  [options.titleColor] Color of the title text (default #ff0000)
	 * @param {Color}  [options.backgroundColor] Background color (default #008800)
	 * @param {Color}  [options.backgroundBorderColor] background border (default #000000)
	 * @param {string} [options.dividerColor] color of the divider between headline and content (white)
	 *
	 */
	constructor(x, y, w, h, options) {
		super(x, y, w, h);
		this.options = options;
		this.options.titleFont = options.titleFont || "24Outline";
		this.options.titleText = options.titleText || "Header";
		this.options.titleColor = options.titleColor || "#ff0000";
		this.options.backgroundColor = options.backgroundColor || "#008800";
		this.options.backgroundBorderColor = options.backgroundBorderColor || "#000000";
		this.options.dividerColor = options.dividerColor || "#008800";
		this.clipping = true;

		this.header = new BitmapText(4, 6, {
			font: this.options.titleFont,
			fillStyle: this.options.titleColor,
			textAlign: "left",
			text: this.options.titleText,
		});

		let headerDim = this.header.measureText();
		this.border = new RoundRect(x, y, w, h);
		this.divider = new Rect(x + 5, y + headerDim.height + 16, w - 10, 2);
		this.header.pos.x = (w - headerDim.width) / 2;
		this.addChild(this.header);

		this.contentContainer = new Rect(5, this.divider.pos.y + 14 - y, w - 10, h - (headerDim.height + 16 + 10));
	}

	draw(renderer, viewport) {
		renderer.setGlobalAlpha(0.3);
		renderer.setColor(this.options.backgroundColor);
		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor(this.options.backgroundBorderColor);
		renderer.stroke(this.divider);
		renderer.stroke(this.border);
		renderer.setColor(this.options.dividerColor);
		renderer.fill(this.divider);
		super.draw(renderer, viewport);
	}
}
