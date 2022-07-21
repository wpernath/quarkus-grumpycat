import { BitmapText, input, timer, game, Container, Vector2d, Text, RoundRect, state, Rect } from "melonjs/dist/melonjs.module.js";
import GlobalGameState from "../util/global-game-state";

class BaseTextButton extends Container {
	
	constructor(x, y, settings) {	
		super(x,y);			
		settings.font = settings.font || "24Outline";
		settings.size = settings.size || 1;
		settings.text = settings.text || "<Click Me>";
		settings.bindKey = settings.bindKey || -1;
		settings.backgroundColor = settings.backgroundColor || "#00aa00";
		settings.hoverColor = settings.hoverColor || "#00ff00";
		settings.borderStrokeColor = settings.borderStrokeColor || '#000000';
		settings.offScreenCanvas = settings.offScreenCanvas || false;
		settings.fillStyle = settings.fillStyle || "#ffffff";
		settings.lineWidth = settings.lineWidth || 1;
		settings.anchorPoint = settings.anchorPoint || new Vector2d(0,0);		

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
		this.font.pos.set(
			Math.round((border.width - dimensions.width) / 2) + this.font.pos.x,
			Math.round((border.height - dimensions.height) / 2) + this.font.pos.y
		);
		
		
		//console.log("Font:   " + this.font.pos.x + "/" + this.font.pos.y);
		//console.log("Border: " + JSON.stringify(this.border.getBounds()));
		//console.log("Renderable: " + this.pos.x + " / " + this.pos.y);
		/**
		 * object can be clicked or not
		 * @public
		 * @type {boolean}
		 * @default true
		 * @name GUI_Object#isClickable
		 */
		this.isClickable = true;

		/**
		 * Tap and hold threshold timeout in ms
		 * @type {number}
		 * @default 250
		 * @name GUI_Object#holdThreshold
		 */
		this.holdThreshold = 250;

		/**
		 * object can be tap and hold
		 * @public
		 * @type {boolean}
		 * @default false
		 * @name GUI_Object#isHoldable
		 */
		this.isHoldable = false;

		/**
		 * true if the pointer is over the object
		 * @public
		 * @type {boolean}
		 * @default false
		 * @name GUI_Object#hover
		 */
		this.hover = false;

		// object has been updated (clicked,etc..)
		this.holdTimeout = null;
		this.released = true;

		// GUI items use screen coordinates
		this.floating = true;

		// enable event detection
		this.isKinematic = false;		
	}

	draw(renderer) {
		renderer.setGlobalAlpha(0.5);
		if( !this.hover ) {
			renderer.setColor(this.settings.backgroundColor);
		}
		else {
			renderer.setColor(this.settings.hoverColor);
		}

		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor(this.settings.borderStrokeColor);
		renderer.stroke(this.border);		
		this.font.draw(renderer, this.settings.text, this.font.pos.x, this.font.pos.y);
	}

	/**
	 * function callback for the pointerdown event
	 * @ignore
	 */
	clicked(event) {
		// Check if left mouse button is pressed
		if (event.button === 0 && this.isClickable) {
			this.dirty = true;
			this.released = false;
			if (this.isHoldable) {
				if (this.holdTimeout !== null) {
					timer.clearTimeout(this.holdTimeout);
				}
				this.holdTimeout = timer.setTimeout(this.hold.bind(this), this.holdThreshold, false);
				this.released = false;
			}
			return this.onClick(event);
		}
	}

	/**
	 * function called when the object is pressed (to be extended)
	 * @name onClick
	 * @memberof GUI_Object
	 * @public
	 * @param {Pointer} event the event object
	 * @returns {boolean} return false if we need to stop propagating the event
	 */
	onClick(event) {
		// eslint-disable-line no-unused-vars
		return false;
	}

	/**
	 * function callback for the pointerEnter event
	 * @ignore
	 */
	enter(event) {
		this.hover = true;
		this.dirty = true;
		return this.onOver(event);
	}

	/**
	 * function called when the pointer is over the object
	 * @name onOver
	 * @memberof GUI_Object
	 * @public
	 * @param {Pointer} event the event object
	 */
	onOver(event) {
		// eslint-disable-line no-unused-vars
		// to be extended
	}

	/**
	 * function callback for the pointerLeave event
	 * @ignore
	 */
	leave(event) {
		this.hover = false;
		this.dirty = true;
		this.release(event);
		return this.onOut(event);
	}

	/**
	 * function called when the pointer is leaving the object area
	 * @name onOut
	 * @memberof GUI_Object
	 * @public
	 * @param {Pointer} event the event object
	 */
	onOut(event) {
		// eslint-disable-line no-unused-vars
		// to be extended
	}

	/**
	 * function callback for the pointerup event
	 * @ignore
	 */
	release(event) {
		if (this.released === false) {
			this.released = true;
			this.dirty = true;
			timer.clearTimeout(this.holdTimeout);
			return this.onRelease(event);
		}
	}

	/**
	 * function called when the object is pressed and released (to be extended)
	 * @name onRelease
	 * @memberof GUI_Object
	 * @public
	 * @returns {boolean} return false if we need to stop propagating the event
	 */
	onRelease() {
		return false;
	}

	/**
	 * function callback for the tap and hold timer event
	 * @ignore
	 */
	hold() {
		timer.clearTimeout(this.holdTimeout);
		this.dirty = true;
		if (!this.released) {
			this.onHold();
		}
	}

	/**
	 * function called when the object is pressed and held<br>
	 * to be extended <br>
	 * @name onHold
	 * @memberof GUI_Object
	 * @public
	 */
	onHold() {}

	/**
	 * function called when added to the game world or a container
	 * @ignore
	 */
	onActivateEvent() {
		// register pointer events
		input.registerPointerEvent("pointerdown", this, this.clicked.bind(this));
		input.registerPointerEvent("pointerup", this, this.release.bind(this));
		input.registerPointerEvent("pointercancel", this, this.release.bind(this));
		input.registerPointerEvent("pointerenter", this, this.enter.bind(this));
		input.registerPointerEvent("pointerleave", this, this.leave.bind(this));
	}

	/**
	 * function called when removed from the game world or a container
	 * @ignore
	 */
	onDeactivateEvent() {
		// release pointer events
		input.releasePointerEvent("pointerdown", this.hitbox);
		input.releasePointerEvent("pointerup", this);
		input.releasePointerEvent("pointercancel", this);
		input.releasePointerEvent("pointerenter", this);
		input.releasePointerEvent("pointerleave", this);
		timer.clearTimeout(this.holdTimeout);
	}
}


class PlayButton extends BaseTextButton {
	constructor(x, y, ) {
		super(x, y, {
			text: 'Play',			
			borderWidth: 250
		});		
	}

	onClick(event) {
		state.change(state.READY);
	}
}

class ReplayButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Replay",
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(state.READY);
	}
}

class HighscoreButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Highscores",		
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(state.SCORE);
	}
}

export default class TitleMenu extends Container {
	constructor() {
		super(0, 0);

		// persistent across level change
		this.isPersistent = true;

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 100;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleMenu";

		let center = Math.round((game.viewport.width - 250) / 2);
		this.addChild(new PlayButton(center, 300));
		this.addChild(new ReplayButton(center, 360));
		this.addChild(new HighscoreButton(center, 420));
	}
}
