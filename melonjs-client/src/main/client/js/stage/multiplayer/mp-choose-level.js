import { Stage, state, game, event, Sprite, BitmapText, Container, loader, Vector2d, input, GUI_Object } from "melonjs";
import BaseClickableComponent from "../../util/base-clickable-component";
import { LevelManager } from "../../util/level";
import GlobalGameState from "../../util/global-game-state";
import { my_state } from "../../util/constants";
import MultiplayerManager from "../../util/multiplayer";

class LeftButton extends GUI_Object {
	constructor(x, y, callback) {
		super(x, y, {
			image: GlobalGameState.screenControlsTexture,
			region: "shadedDark24",
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

	constructor(level, x, y) {
		super(x, y, game.viewport.width - 280, 500);

        this.clipping = true;
        this.floating = false;
        
		this.level = level;
        this.name = this.level.longName;
        this.description = this.level.description;
		this.mapSize = "Map size: " + this.level.mapWidth + " x " + this.level.mapHeight;
		this.numPlayers = "Max players: " + this.level.numPlayers;		
        this.image = loader.getImage(this.level.previewImage);

		console.log("  creating LevelEntry(" + this.name + ")");
		this.titleFont = new BitmapText(15+348+15, 20, {
			font: "18Outline",		
			text: this.name,
			anchorPoint: new Vector2d(0, 0),
		});

		this.descriptionFont = new BitmapText(15+348+15, 60, {
			font: "12Outline",
            lineHeight: 1.5,
            text: this.description,
			anchorPoint: new Vector2d(0, 0),
		});

		this.mapSizeFont = new BitmapText(15 + 348 + 15, 400, {
			font: "18Outline",
			text: this.mapSize,
			anchorPoint: new Vector2d(0, 0),
		});

		this.numPlayersFont = new BitmapText(15 + 348 + 15, 440, {
			font: "18Outline",
			text: this.numPlayers,
			anchorPoint: new Vector2d(0, 0),
		});

        this.addChild(this.titleFont);
        this.addChild(this.descriptionFont);
		this.addChild(this.mapSizeFont);
		this.addChild(this.numPlayersFont);
		this.callbackOnClick = undefined;
	}

	draw(renderer) {
        renderer.drawImage(this.image, this.pos.x + 15, this.pos.y + 20, 348, 444);
        super.draw(renderer);
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

export class ChooserComponent extends Container {
	listComponents = [];
    levelChosen = false;
	levelIndex = 0;

	constructor(levels) {
		super();

		this.levels = levels;

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "LevelChooser";

        this.prev = new LeftButton(86, 360, this.prevLevel.bind(this));
        this.next = new RightButton(game.viewport.width - 86, 360, this.nextLevel.bind(this));
        this.addChild(this.prev);
        this.addChild(this.next);
        
        for(let levelIndex = 0; levelIndex < this.levels.length; levelIndex++ ) {
            let entry = new ListEntry(this.levels[levelIndex], 130, 220);
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
            console.log("  selected level = " + levelIndex );
			MultiplayerManager.getInstance().useSelectedLevel(this.levelIndex);            
            this.levelChosen = true;
        }
	}
}

