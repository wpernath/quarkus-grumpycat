import { Stage, state, game, event, Sprite, BitmapText, Container, loader, Vector2d, input, GUI_Object } from "melonjs/dist/melonjs.module.js";
import BaseClickableComponent from "../util/base-clickable-component";
import { LevelManager } from "../util/level";
import GlobalGameState from "../util/global-game-state";
import { my_state } from "../util/constants";
import { StateBackground } from "./state_background";
import { BaseContainer } from "../util/base-container";

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

	constructor(levelIndex, x, y, w, h) {
		super(x, y, w, h);

        this.clipping = false;
        this.floating = false;
        this.levelIndex = levelIndex;
		this.currentLevel = LevelManager.getInstance().setCurrentLevel(levelIndex);
        this.name = this.currentLevel.longName;
        this.description = this.currentLevel.description;
		this.mapSize = "Map size: " + this.currentLevel.mapWidth + " x " + this.currentLevel.mapHeight;
        this.image = loader.getImage(this.currentLevel.previewImage);

		
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
			new BitmapText(358, 90, {
				font: "18Outline",
				text: "Description: ",
				fillStyle: "#ffa000",
			})
		);

		this.addChild(
			new BitmapText(358, 120, {
				font: "12Outline",
				lineHeight: 1.5,
				wordWrapWidth: w-358,
				text: this.description,
			})
		);

		this.callbackOnClick = undefined;
	}

	draw(renderer) {
        renderer.drawImage(this.image, this.pos.x + 5, this.pos.y, 348, 444);
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

class ChooserComponent extends BaseContainer {
	listComponents = [];
    levelChosen = false;
	constructor() {
		let w = 900;
		let h = 505;
		let x = (game.viewport.width - w) / 2;
		let y = game.viewport.height - h - 60;
		super(x, y, w, h, {
			titleText: "Choose a Level",
			backgroundAlpha: 0.4,
			backgroundColor: "#202020",
		});

		// make sure we use screen coordinates
		this.floating = false;
		this.clipping = false;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleBack";
		y = (h - 77) / 2;
		this.prev = new LeftButton(this.pos.x + 2, this.pos.y + y, this.prevLevel.bind(this));
		this.next = new RightButton(this.pos.x + w - 80, this.pos.y + y, this.nextLevel.bind(this));
        this.addChild(this.prev);
        this.addChild(this.next);
        
		LevelManager.getInstance().reset();		
        for(let levelIndex = 0; levelIndex < LevelManager.getInstance().levelCount(); levelIndex++ ) {
            let entry = new ListEntry(levelIndex, this.contentContainer.pos.x + 80, this.contentContainer.pos.y, w - 180, h - 50);
            entry.setCallbackOnClick(this.useSelectedGame.bind(this));
            entry.setOpacity(0.8);
            this.listComponents.push(entry);            
        } 
		
        LevelManager.getInstance().reset();
        this.addChild(this.listComponents[0]);
	}

    prevLevel() {
        let currentLevel = LevelManager.getInstance().getCurrentLevelIndex();
        if( LevelManager.getInstance().hasPrev()) {
            this.removeChild(this.listComponents[currentLevel], true);
            LevelManager.getInstance().prev();
            this.addChild(this.listComponents[currentLevel-1]);
        }
    }

    nextLevel() {
        let currentLevel = LevelManager.getInstance().getCurrentLevelIndex();
        if (LevelManager.getInstance().hasNext()) {
            this.removeChild(this.listComponents[currentLevel], true);
            LevelManager.getInstance().next();
            this.addChild(this.listComponents[currentLevel + 1]);
        }        
    }

	useSelectedGame(levelIndex) {
        if( !this.levelChosen ) {
            console.log("  selected level = " + levelIndex );
            LevelManager.getInstance().setCurrentLevel(levelIndex);
            state.change(state.READY);
            this.levelChosen = true;
        }
	}
}

export class ChooseLevelScreen extends Stage {
    chooserComponent = null;

	onResetEvent() {
        console.log("ChooserLevel.onEnter()")
		this.back = new StateBackground("Choose Level", false, false);
		game.world.addChild(this.back);

		this.chooserComponent = new ChooserComponent();
		game.world.addChild(this.chooserComponent);

		this.handler = event.on(event.KEYUP, (action, keyCode, edge) => {
            if (!state.isCurrent(my_state.CHOOSE_LEVEL)) return;
			if (action === "exit") {
				state.change(my_state.SINGLE_PLAYER_MENU);
			}
            else if( action === "left") {
                this.chooserComponent.prevLevel();
            }
            else if( action === "right") {
                this.chooserComponent.nextLevel();
            }
            else if( action === "bomb") {
                this.chooserComponent.useSelectedGame(LevelManager.getInstance().getCurrentLevelIndex());
            }
		});

	}

	onDestroyEvent() {
        console.log("ChooserLevel.onExit()");
		event.off(event.KEYUP, this.handler);		
		game.world.removeChild(this.chooserComponent);        
		game.world.removeChild(this.back);
	}
}