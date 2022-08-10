import { Stage, event, loader, game, state, Vector2d, Container, BitmapText, Rect, Sprite, input, ImageLayer } from "melonjs/dist/melonjs.module.js";
import BaseClickableComponent from "../util/base-clickable-component";
import GlobalGameState from "../util/global-game-state";

import NetworkManager from "../util/network";
import { my_state } from "../util/constants";

class ListEntry extends BaseClickableComponent {
	font;
	nameText;
	dateText;
	scoreText;
	borderColor;
	callbackOnClick;

	constructor(g, x, y, w) {
		super(x, y, w, 32);

		this.gameEntry = g;		

		this.playerFont = new BitmapText(x, y, {
			font: "24Outline",
			size: 1,
			text: "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
			anchorPoint: new Vector2d(0, 0),
		});

		this.dateFont = new BitmapText(x + 300, y, {
			font: "24Outline",
			size: 1,
			anchorPoint: new Vector2d(0, 0),
		});

		this.gameFont = new BitmapText(x + 500, y, {
			font: "24Outline",
			size: 1,
			fillStyle: "#ffffff",
			text: this.gameEntry.name,
			textAlign: "left",
			anchorPoint: new Vector2d(0, 0),
		});

		this.fontSize = this.playerFont.measureText();
		super.setShape(x, y, w, this.fontSize.height + 16);
		this.border = new Rect(x, y, w, this.fontSize.height + 16);

		this.gameFont.pos.x += 8;
		this.gameFont.pos.y += 8;

		this.dateFont.pos.x += 8;
		this.dateFont.pos.y += 8;

		this.playerFont.pos.x += 8;
		this.playerFont.pos.y += 8;

		this.playerName = this.gameEntry.player.name;
		this.gameName = this.gameEntry.name;
		this.dateTime = new Date(this.gameEntry.time).toLocaleDateString();

		this.borderColor = "#008800";
		this.callbackOnClick = this.onClick;
	}

	draw(renderer) {
		renderer.setGlobalAlpha(0.5);
		renderer.setColor(this.borderColor);
		renderer.fill(this.border);

		renderer.setGlobalAlpha(1);
		renderer.setColor("#000000");
		renderer.stroke(this.border);

		renderer.setColor("#ffffff");
		this.gameFont.draw(renderer, this.gameName, this.gameFont.pos.x, this.gameFont.pos.y);
		this.dateFont.draw(renderer, this.dateTime, this.dateFont.pos.x, this.dateFont.pos.y);
		this.playerFont.draw(renderer, this.playerName, this.playerFont.pos.x, this.playerFont.pos.y);
	}

	setCallbackOnClick(callback) {
		this.callbackOnClick = callback;
	}

	onClick(event) {
		console.log("onClick");
		this.callbackOnClick(this.gameEntry);
	}
	onOver(event) {
		this.borderColor = "#00aa00";
		this.isDirty = true;
	}

	onOut(event) {
		this.borderColor = "#008800";
		this.isDirty = true;
	}
}

class ReplayComponent extends Container {
	listComponents = [];

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
			text: "REPLAY GAME",
			offScreenCanvas: false,
		});

		this.addChild(this.titleText);
		this.addChild(this.subTitleText);
	}

	updateList(games) {
		if (games !== null && games.length > 0) {
			// create a ListEntry for each game found in list
			for (let i = 0; i < games.length; i++) {
				let comp = new ListEntry(games[i], 50, 250 + 42 * i, game.viewport.width - 100, 36);
				this.listComponents.push(comp);
				this.addChild(comp);
				comp.setCallbackOnClick(this.useSelectedGame);
				if( i >= 10 ) break;
			}
			this.isDirty = true;
		} 
	}

	useSelectedGame(game) {
		console.log("  selected game = " + JSON.stringify(game));

		NetworkManager.getInstance()
			.readPlayerActionsFromServer(game)
			.then(function(res) {
				//console.log("Successfully read player actions from server: " + JSON.stringify(res));
				GlobalGameState.gameToReplay = game;
				GlobalGameState.replayActions = res;
				state.change(my_state.REPLAY_GAME);				
			})
			.catch(function(err) {
				console.error("Could not read player actions: " + err);
				state.change(state.MENU);
			})
	}
}

export default class ReplayChooserScreen extends Stage {
	onResetEvent() {
		this.replay = new ReplayComponent();
		game.world.addChild(this.replay);

		//input.bindPointer(input.pointer.LEFT, input.KEY.ESC);

		this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.REPLAY_GAME_CHOOSER)) return;
			if (action === "exit") {
				state.change(state.MENU);
			}
		});

		NetworkManager.getInstance()
			.readLastGamesFromServer()
			.then((out) => this.replay.updateList(out))
			.catch((err) => console.log(err));
	}

	onDestroyEvent() {
		event.off(event.KEYDOWN, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.replay);
	}
}
