import { GUI_Object, Sprite, game, input, Vector2d, Container, event, device, plugins } from "melonjs/dist/melonjs.module.js";
import GlobalGameState from "../../util/global-game-state";
/**
 * a basic control to toggle fullscreen on/off
 */
class ActionButton extends GUI_Object {
	/**
	 * constructor
	 */
	constructor(x, y) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark38",
		});
		this.setOpacity(0.5);
		this.anchorPoint.set(0, 0);
	}

	/**
	 * function called when the object is clicked on
	 */
	onClick(event) {
		this.setOpacity(0.25);
		input.triggerKeyEvent(input.KEY.SPACE, true);
		return false;
	}

	/**
	 * function called when the object is clicked on
	 */
	onRelease(event) {
		this.setOpacity(0.5);
		input.triggerKeyEvent(input.KEY.SPACE, false);
		return false;
	}
}

class FullScreenButton extends GUI_Object {
	/**
	 * constructor
	 */
	constructor(x, y) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark30",
		});
		this.setOpacity(0.5);
		this.anchorPoint.set(0, 0);
	}

	/**
	 * function called when the object is clicked on
	 */
	onClick(event) {
		this.setOpacity(0.25);
		input.triggerKeyEvent(input.KEY.F, true);
		input.triggerKeyEvent(input.KEY.F, false);
		return false;
	}

	/**
	 * function called when the object is clicked on
	 */
	onRelease(event) {
		this.setOpacity(0.5);
		input.triggerKeyEvent(input.KEY.F, false);
		return false;
	}
}

class PauseButton extends GUI_Object {
	/**
	 * constructor
	 */
	constructor(x, y) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark14", // pause // shadedDark16: play
		});
		this.setOpacity(0.5);
		this.anchorPoint.set(0, 0);
		this.isPaused = false;
	}

	/**
	 * function called when the object is clicked on
	 */
	onClick(event) {
		this.setOpacity(0.25);
		if( !this.isPaused ) {
			this.isPaused = true;
			this.tint.setColor(50,50,0);
		}
		else {
			this.isPaused = false;
			this.tint.setColor(255, 255, 255);

		}
		input.triggerKeyEvent(input.KEY.P, true);
		return false;
	}

	/**
	 * function called when the object is clicked on
	 */
	onRelease(event) {
		this.setOpacity(0.5);
		input.triggerKeyEvent(input.KEY.P, false);
		return false;
	}
}

class ExitButton extends GUI_Object {
	/**
	 * constructor
	 */
	constructor(x, y) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark35",
		});
		this.setOpacity(0.5);
		this.anchorPoint.set(0, 0);
	}

	/**
	 * function called when the object is clicked on
	 */
	onClick(event) {
		this.setOpacity(0.25);
		input.triggerKeyEvent(input.KEY.ESC, true);		
		return false;
	}

	/**
	 * function called when the object is clicked on
	 */
	onRelease(event) {
		this.setOpacity(0.5);
		input.triggerKeyEvent(input.KEY.ESC, false);
		return false;
	}
}


class OtherButton extends GUI_Object {
	/**
	 * constructor
	 */
	constructor(x, y) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark36",
		});
		this.setOpacity(0.5);
		this.anchorPoint.set(0, 0);
	}

	/**
	 * function called when the object is clicked on
	 */
	onClick(event) {
		this.setOpacity(0.25);
		input.triggerKeyEvent(input.KEY.SHIFT, true);
		return false;
	}

	/**
	 * function called when the object is clicked on
	 */
	onRelease(event) {
		this.setOpacity(0.5);
		input.triggerKeyEvent(input.KEY.SHIFT, false);
		return false;
	}
}

/**
 * a virtual joypad
 */
class Joypad extends GUI_Object {
	/**o
	 * constructor
	 */
	constructor(x, y) {
		super(x, y, {
			// background "fix" part of the joypad
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark07",
			anchorPoint: new Vector2d(0, 0),
		});

		// mobile part of the joypad
		this.pad = new Sprite(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark01",
			anchorPoint: new Vector2d(0, 0),
		});

		// default relative position from the back of the joypad
		this.relative = new Vector2d(this.width / 2 - this.pad.width / 2, this.height / 2 - this.pad.height / 2);

		// offset by which the joypad move when pressed/moved
		this.joypad_offset = new Vector2d();

		// default opacity
		this.setOpacity(0.5);

		// cursors status
		// TODO make it configurable
		this.cursors = {
			up: false,
			down: false,
			left: false,
			right: false,
		};

		// register on the pointermove event
		input.registerPointerEvent("pointermove", this, this.pointerMove.bind(this));
	}

	onDestroyEvent() {
		// release register event event
		input.releasePointerEvent("pointermove", this);
	}

	/**
	 * pointermove function
	 */
	pointerMove(event) {
		if (this.released === false) {
			let x = Math.round(event.gameScreenX + event.width / 2);
			let y = Math.round(event.gameScreenY + event.height / 2);
			// pointerMove is a global on the viewport, so check for coordinates
			if (this.getBounds().contains(x, y)) {
				// if any direction is active, update it if necessary
				if (this.cursors.left === true || this.cursors.right === true || this.cursors.up === true || this.cursors.down === true) {
					this.checkDirection.call(this, x, y);
				}
			} 
			else {
				// release keys/joypad if necessary
				this.onRelease.call(this, event);
			}
		}
	}

	// update the cursors value and trigger key event
	checkDirection(x, y) {
		x = Math.round(x);
		y = Math.round(y);
		let rx = x - this.pos.x;
		let ry = y - this.pos.y;
		let rw = this.width / 2;
		let rh = this.height / 2;
		let dx = rx - rw;
		let dy = ry - rh;
		let xAchsis = Math.abs(dx) > 20;
		let yAchsis = Math.abs(dy) > 20;

		//console.log("checking if (" + x + "|" + y + ")" + " (" + rx + "|" + ry + ")" + " within (" + this.width + "|" + this.height + ") - distance (" + dx + "|" + dy + ")");

		if (yAchsis && dy < 0) {
			if (this.cursors.up === false) {
				input.triggerKeyEvent(input.KEY.UP, true);
				this.cursors.up = true;
				this.joypad_offset.y = -(((rh - ry) % this.pad.height) / 4);
			}
			// release the right key if it was pressed
			if (this.cursors.down === true) {
				input.triggerKeyEvent(input.KEY.DOWN, false);
				this.cursors.down = false;
			}
		}
		if (yAchsis && dy > 0) {
			if (this.cursors.down === false) {
				input.triggerKeyEvent(input.KEY.DOWN, true);
				this.cursors.down = true;
				this.joypad_offset.y = +(((ry - rh) % this.pad.height) / 4);
			}
			// release the left key is it was pressed
			if (this.cursors.up === true) {
				input.triggerKeyEvent(input.KEY.UP, false);
				this.cursors.up = false;
			}
		}

		if (xAchsis && dx < 0) {
			if (this.cursors.left === false) {
				input.triggerKeyEvent(input.KEY.LEFT, true);
				this.cursors.left = true;
				this.joypad_offset.x = -(((rw - (rx)) % this.pad.width) / 4);
			}
			// release the right key if it was pressed
			if (this.cursors.right === true) {
				input.triggerKeyEvent(input.KEY.RIGHT, false);
				this.cursors.right = false;
			}
		}
		if (xAchsis && dx > 0) {
			if (this.cursors.right === false) {
				input.triggerKeyEvent(input.KEY.RIGHT, true);
				this.cursors.right = true;
				this.joypad_offset.x = +(((rx - rw) % this.pad.width) / 4);
			}
			// release the left key is it was pressed
			if (this.cursors.left === true) {
				input.triggerKeyEvent(input.KEY.LEFT, false);
				this.cursors.left = false;
			}
		}
	}

	/**
	 * function called when the object is clicked on
	 */
	onClick(event) {
		let x = event.gameScreenX + event.width / 2;
		let y = event.gameScreenY + event.height / 2;
		this.setOpacity(0.25);
		this.checkDirection.call(this, x, y);
		//console.log(JSON.stringify(this.cursors));
		return false;
	}

	/**
	 * function called when the object is release or cancelled
	 */
	onRelease(event) {
		this.setOpacity(0.5);
		if (this.cursors.left === true) {
			input.triggerKeyEvent(input.KEY.LEFT, false);
			this.cursors.left = false;
		}
		if (this.cursors.right === true) {
			input.triggerKeyEvent(input.KEY.RIGHT, false);
			this.cursors.right = false;
		}
		if (this.cursors.up === true) {
			input.triggerKeyEvent(input.KEY.UP, false);
			this.cursors.up = false;
		}
		if (this.cursors.down === true) {
			input.triggerKeyEvent(input.KEY.DOWN, false);
			this.cursors.down = false;
		}
		//console.log(JSON.stringify(this.cursors));
		this.joypad_offset.set(0, 0);
		return false;
	}

	/**
	 * extend the draw function
	 */
	draw(renderer) {
		// call the super constructor
		super.draw(renderer);
		this.pad.pos.setV(this.pos).add(this.relative).add(this.joypad_offset);
		this.pad.draw(renderer);
	}
}

/**
 * a very simple virtual joypad and buttons, that triggers
 * corresponding key events
 */
class VirtualJoypad extends Container {
	constructor() {
		// call the constructor
		super();

		// persistent across level change
		this.isPersistent = true;

		// Use screen coordinates
		this.floating = true;

		// make sure our object is always draw first
		this.z = Infinity;

		// give a name
		this.name = "VirtualJoypad";

		let yPos = GlobalGameState.isMultiplayerMatch ? 64 : 50;

		// instance of the buttons
		this.pauseButton = new PauseButton(20, yPos);
		this.exitButton = new ExitButton(game.viewport.width - 48 - 20, yPos);

		// instance of the virtual joypad
		if( device.isMobile) {
			this.actionButton = new ActionButton(game.viewport.width - 200, game.viewport.height - 150);
			this.otherButton = new OtherButton(game.viewport.width - 120, game.viewport.height - 200);
			this.joypad = new Joypad(50, game.viewport.height - 200);
			this.addChild(this.joypad);
			this.addChild(this.actionButton);
			this.addChild(this.otherButton);
		}
		if( !device.isMobile) {
			this.fullScreenButton = new FullScreenButton(90, yPos);
			this.addChild(this.fullScreenButton);
		}

		this.addChild(this.pauseButton);
		this.addChild(this.exitButton);		

		// re-position the button in case of
		// size/orientation change
		let self = this;
		event.on(event.VIEWPORT_ONRESIZE, function (width, height) {
			if( device.isMobile) {
				self.actionButton.pos.set(width - 200, height - 150, self.button.pos.z);
				self.otherButton.pos.set(width - 120, height - 200, self.button.pos.z);
			}
			self.exitButton.pos.set(width - 48 - 20, yPos, self.button.pos.z);
		});
	}
}

export default VirtualJoypad;
