import { Vector2d,BitmapText, RoundRect,  } from "melonjs";
import BaseClickableComponent from "./base-clickable-component";
export default class BaseTextButton extends BaseClickableComponent {
	constructor(x, y, settings) {
		super(x, y);
		settings.font = settings.font || "24Outline";
		settings.size = settings.size || 1;
		settings.text = settings.text || "<Click Me>";
		settings.bindKey = settings.bindKey || -1;
		settings.backgroundColor = settings.backgroundColor || "#00aa00";
		settings.hoverColor = settings.hoverColor || "#00ff00";
		settings.borderStrokeColor = settings.borderStrokeColor || "#000000";
		settings.offScreenCanvas = settings.offScreenCanvas || false;
		settings.fillStyle = settings.fillStyle || "#ffffff";
		settings.lineWidth = settings.lineWidth || 1;
		settings.anchorPoint = settings.anchorPoint || new Vector2d(0, 0);

		let font = new BitmapText(x, y, settings);
		let dimensions = font.measureText();
		settings.borderWidth = settings.borderWidth || dimensions.width + 16;
		settings.borderHeight = settings.borderHeight || dimensions.height + 16;

		let border = new RoundRect(x, y, settings.borderWidth, settings.borderHeight);
		super.setShape(x, y, border.getBounds().width, border.getBounds().height);

		// build up
		this.font = font;
		this.dimensions = dimensions;
		this.border = border;
		this.settings = settings;

		// adjust text position
		this.font.pos.set(Math.round((border.width - dimensions.width) / 2) + this.font.pos.x, Math.round((border.height - dimensions.height) / 2) + this.font.pos.y);

		//console.log("Font:   " + this.font.pos.x + "/" + this.font.pos.y);
		//console.log("Border: " + JSON.stringify(this.border.getBounds()));
		//console.log("Renderable: " + this.pos.x + " / " + this.pos.y);
	}

	draw(renderer) {
		renderer.setGlobalAlpha(0.5);
		if (!this.hover) {
			renderer.setColor(this.settings.backgroundColor);
		} else {
			renderer.setColor(this.settings.hoverColor);
		}

		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor(this.settings.borderStrokeColor);
		renderer.stroke(this.border);
		this.font.draw(renderer, this.settings.text, this.font.pos.x, this.font.pos.y);
	}
}
