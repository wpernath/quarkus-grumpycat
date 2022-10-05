import { Stage, state, pool, game, event, BitmapText, Container, loader, input, GUI_Object, Vector2d } from "melonjs";
import BaseClickableComponent from "../../util/base-clickable-component";
import { LevelManager } from "../../util/level";
import GlobalGameState from "../../util/global-game-state";
import { my_state } from "../../util/constants";
import MultiplayerManager from "../../util/multiplayer";
import { BaseContainer } from "../../util/base-container";

class LeftButton extends GUI_Object {
	constructor(x, y, callback) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark24",
			anchorPoint: new Vector2d(0,0),
		});
        this.callback = callback
		this.setOpacity(0.5);
	}

	onClick() {
        if( this.callback !== undefined ) {
            this.callback();
        }
    }
    onRelease() {}

	onOver() {
		this.setOpacity(0.8);
	}

	onOut() {
		this.setOpacity(0.5);
	}
}

class RightButton extends GUI_Object {
	constructor(x, y, callback) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark25",
			anchorPoint: new Vector2d(0, 0),
		});
        this.callback = callback;
		this.setOpacity(0.5);
	}

	onOver() {
		this.setOpacity(0.8);
	}

	onOut() {
		this.setOpacity(0.5);
	}

	onClick() {
        if (this.callback !== undefined) {
			this.callback();
        }
    }
}

class ListEntry extends BaseClickableComponent {
    currentLevel;
    levelIndex;
    name;
    description;
	mapSize;
    image;
	callbackOnClick;

	constructor(g, x, y, w, h) {
		super(x, y, w, h);

        this.clipping = false;
        this.floating = false;
        
		this.game  = g;		
		this.level = MultiplayerManager.get().allLevels()[g.level];
		
        this.name = this.level.longName;
        this.description = this.level.description;
        this.image = loader.getImage(this.level.previewImage);
		

		this.addChild( new BitmapText(358, 0, {
			font: "18Outline",
			text: "Multiplayer Session",
			fillStyle: "#ffa000",
		}));

		this.addChild( new BitmapText(358, 30, {
			font: "12Outline",
			text: "Opened By: " + this.game.player1.name,
		}));

		let date = new Date(this.game.timeStarted);
		this.addChild( new BitmapText(358, 50, {
			font: "12Outline",
			text: "Opened on: " + date.toLocaleDateString() + " " + date.toLocaleTimeString(),
		}));

		this.addChild( new BitmapText(358, 80, {
			font: "18Outline",
			text: "Map information",
			fillStyle: "#ffa000",
		}));


		this.addChild(new BitmapText(358, 110, {
			font: "12Outline",		
			text: "Name: " + this.name,
		}));

		this.addChild(new BitmapText(358, 130, {
			font: "12Outline",
			text: "Map size: " + this.level.mapWidth + " x " + this.level.mapHeight,
		}));

		this.addChild(new BitmapText(358, 150, {
			font: "12Outline",
			text: "Max players: " + this.level.numPlayers,			
		}));

		this.addChild(
			new BitmapText(358, 180, {
				font: "18Outline",
				text: "Description: ",
				fillStyle: "#ffa000",
			})
		);

		this.addChild(new BitmapText(358, 210, {
			font: "12Outline",
            lineHeight: 1.5,
            text: this.description,
		}));

		this.callbackOnClick = undefined;
	}

	draw(renderer, viewport) {
        renderer.drawImage(this.image, this.pos.x + 5, this.pos.y, 348, 444);
        super.draw(renderer, viewport);
	}

	setCallbackOnClick(callback) {
		this.callbackOnClick = callback;
	}

	onClick(event) {
		this.callbackOnClick(this.game);
	}

	onOver(event) {		
		this.setOpacity(1.0)	
	}

	onOut(event) {		
		this.setOpacity(0.8)
	}
}

export class GameChooserComponent extends BaseContainer {
	listComponents = [];
    levelChosen = false;
	levelIndex = 0;

	constructor(levels) {
		let w = 900;
		let h = 505;
		let x = (game.viewport.width - w) / 2;
		let y = game.viewport.height - h - 60;
		super(x, y, w, h, {
			titleText: "Choose a Match to join",
			backgroundAlpha: 0.4,
			backgroundColor: "#202020",
		});

		// make sure we do not use screen coordinates
		this.floating = false;

		// but clipping must be true
		this.clipping = true;

		this.levels = levels;

		// always on toppest
		this.z = 12;

		// give a name
		this.name = "GameChooser";

		y = (h - 77) / 2;
		this.prev = new LeftButton(this.pos.x + 2, this.pos.y + y, this.prevLevel.bind(this));
		this.next = new RightButton(this.pos.x + w - 80, this.pos.y + y, this.nextLevel.bind(this));
		this.addChild(this.prev);
		this.addChild(this.next);

		for (let levelIndex = 0; levelIndex < this.levels.length; levelIndex++) {
			let entry = new ListEntry(this.levels[levelIndex], this.contentContainer.pos.x + 80, this.contentContainer.pos.y, w - 180, h - 50);
			entry.setCallbackOnClick(this.useSelectedGame.bind(this));
			entry.setOpacity(0.8);
			this.listComponents.push(entry);
		}

		if (this.listComponents.length > 0) {
			this.addChild(this.listComponents[0]);
		} else {
			console.log("no entries in list");
		}
	}

    prevLevel() {
        let currentLevel = this.levelIndex;
        if( currentLevel > 0 ) {
            this.removeChild(this.listComponents[currentLevel], true);
            this.levelIndex -= 1;
            this.addChild(this.listComponents[currentLevel-1]);
        }
    }

    nextLevel() {
        let currentLevel = this.levelIndex;
        if (currentLevel < this.levels.length -1 ) {
            this.removeChild(this.listComponents[currentLevel], true);
            this.levelIndex += 1;
            this.addChild(this.listComponents[currentLevel + 1]);
        }        
    }

	useSelectedGame(game) {
        if( !this.levelChosen ) {
			this.levelChosen = true;
            console.log("  selected game = " + game );
			MultiplayerManager.get().setGameToJoin(game);                        
			MultiplayerManager.get().joinGame()
				.then( () => {
					console.log("Game joined");
					state.change(my_state.MULTIPLAYER_LOBBY);
				})
				.catch( (err) => {
					console.log("ERROR joining game: " + err);
					state.change(my_state.MULTIPLAYER_MENU);
				})
        }
	}
}

