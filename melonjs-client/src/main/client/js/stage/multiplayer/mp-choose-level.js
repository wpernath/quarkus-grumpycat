import { Stage, state, game, event, Sprite, BitmapText, Container, loader, Vector2d, input, GUI_Object } from "melonjs/dist/melonjs.module.js";
import BaseClickableComponent from "../../util/base-clickable-component";
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

	constructor(level, x, y, w, h) {
		super(x, y, w, h);

        this.clipping = false;
        this.floating = false;
        
		this.level = level;
        this.name = this.level.longName;
        this.description = this.level.description;
		this.mapSize = "Map size: " + this.level.mapWidth + " x " + this.level.mapHeight;
		this.numPlayers = "Max players: " + this.level.numPlayers;		
        this.image = loader.getImage(this.level.previewImage);

		this.addChild(
			new BitmapText(358, 0, {
				font: "18Outline",
				text: "Map information",
				fillStyle: "#ffa000",
			})
		);

		this.addChild(
			new BitmapText(358, 30, {
				font: "12Outline",
				text: "Name: " + this.name,
			})
		);

		this.addChild(
			new BitmapText(358, 50, {
				font: "12Outline",
				text: this.mapSize,
			})
		);

		this.addChild(
			new BitmapText(358, 70, {
				font: "12Outline",
				text: "Max players: " + this.level.numPlayers,
			})
		);

		this.addChild(
			new BitmapText(358, 110, {
				font: "18Outline",
				text: "Description: ",
				fillStyle: "#ffa000",
			})
		);

		this.addChild(
			new BitmapText(358, 140, {
				font: "12Outline",
				lineHeight: 1.5,
				text: this.description,
			})
		);
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
		this.callbackOnClick(this.levelIndex);
	}

	onOver(event) {		
		this.setOpacity(1.0)	
	}

	onOut(event) {		
		this.setOpacity(0.8)
	}
}

export class ChooserComponent extends BaseContainer {
	listComponents = [];
    levelChosen = false;
	levelIndex = 0;

	constructor(levels) {
		let w = 900;
		let h = 505;
		let x = (game.viewport.width - w) / 2;
		let y = (game.viewport.height - h) - 60;
		super(x, y, w, h, {
			titleText: "Choose a Level",
			backgroundAlpha: 0.4,
			backgroundColor: "#202020",
		});

		this.levels = levels;

		// make sure we do not use screen coordinates
		this.floating = false;

		// but clipping must be true
		this.clipping = true;

		// always on toppest
		this.z = 12;

		// give a name
		this.name = "LevelChooser";

		y = ((h - 77) / 2);
        this.prev = new LeftButton(this.pos.x + 2, this.pos.y + y, this.prevLevel.bind(this));
        this.next = new RightButton(this.pos.x + w - 80, this.pos.y + y, this.nextLevel.bind(this));
        this.addChild(this.prev);
        this.addChild(this.next);
        
        for(let levelIndex = 0; levelIndex < this.levels.length; levelIndex++ ) {
            let entry = new ListEntry(this.levels[levelIndex], this.contentContainer.pos.x + 80, this.contentContainer.pos.y, w-180, h - 50);
            entry.setCallbackOnClick(this.useSelectedGame.bind(this));
            entry.setOpacity(0.8);
            this.listComponents.push(entry);            
        }

		if( this.listComponents.length > 0 ) {       
        	this.addChild(this.listComponents[0]);
		}
		else {
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

	useSelectedGame(levelIndex) {
        if( !this.levelChosen ) {
            console.log("  selected level = " + this.levelIndex );
			MultiplayerManager.get().useSelectedLevel(this.levelIndex);            
            this.levelChosen = true;

			MultiplayerManager.get()
				.createGame()
				.then((game) => {
					state.change(my_state.MULTIPLAYER_LOBBY);
				});		

        }
	}
}

