import { Stage, event, loader, game, state, Vector2d, Container, BitmapText, Rect, Sprite, input, ImageLayer, pool } from "melonjs/dist/melonjs.module.js";

import BaseTextButton from "../../util/base-text-button";

import { my_state } from "../../util/constants";

class StartGameButton extends BaseTextButton {
    constructor(x,y) {
        super(x,y, {
            text: "Start Game",
            borderWidth: 250,
            fillStyle: pool.pull("Color", 255,100,100),
        });

        
    }

    onClick() {
        state.change(my_state.MULTIPLAYER_START_GAME);
    }
}

class JoinGameButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Join Game",
			borderWidth: 250,
		});
	}

	onClick() {
		state.change(my_state.MULTIPLAYER_JOIN_GAME);
	}
}

class BackButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Back",
			borderWidth: 250,
		});
	}

    onClick() {
        state.change(state.MENU);
    }
}


class MenuComponent extends Container {

	constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleBack";

		// add elements
		//this.imageLayer = new ImageLayer()
		this.backgroundImage = new Sprite(game.viewport.width / 2, game.viewport.height / 2, {
			image: loader.getImage("sensa_grass"),
		});

		// scale to fit with the viewport size
		this.backgroundImage.scale(game.viewport.width / this.backgroundImage.width, game.viewport.height / this.backgroundImage.height);
		this.backgroundImage.setOpacity(0.4);
		this.addChild(this.backgroundImage);

		// title and subtitle
		this.titleText = new Sprite(86, -10, {
			image: loader.getImage("title"),
			anchorPoint: new Vector2d(0, 0),
		});

		this.subTitleText = new BitmapText(126, 160, {
			font: "Shadow",
			size: "1",
			fillStyle: "white",
			textAlign: "left",
			text: "MULTIPLAYER",			
		});

		this.addChild(this.titleText);
		this.addChild(this.subTitleText);

        this.addChild(new StartGameButton((game.viewport.width - 250)/2, 300));
        this.addChild(new JoinGameButton((game.viewport.width - 250) / 2, 360));
        this.addChild(new BackButton((game.viewport.width - 250) / 2, 420));        
	}

}

export default class MultiplayerMenuScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);

		this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_MENU)) return;
			if (action === "exit") {
				state.change(state.MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYDOWN, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.menu);
	}
}
