import { Stage, state, game, event, Sprite, BitmapText, Container, loader, Vector2d, input, GUI_Object } from "melonjs";
import BaseClickableComponent from "../util/base-clickable-component";
import { LevelManager } from "../util/level";
import GlobalGameState from "../util/global-game-state";

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
    image;
	callbackOnClick;

	constructor(levelIndex, x, y) {
		super(x, y, game.viewport.width - 280, 500);

        this.clipping = true;
        this.floating = false;
        this.levelIndex = levelIndex;
		this.currentLevel = LevelManager.getInstance().setCurrentLevel(levelIndex);
        this.name = this.currentLevel.longName;
        this.description = this.currentLevel.description;
        this.image = loader.getImage(this.currentLevel.previewImage);

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

        this.addChild(this.titleFont);
        this.addChild(this.descriptionFont);
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

class ChooserComponent extends Container {
	listComponents = [];
    levelChosen = false;
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
			text: "Choose Level",			
		});

        this.prev = new LeftButton(86, 360, this.prevLevel.bind(this));
        this.next = new RightButton(game.viewport.width - 86, 360, this.nextLevel.bind(this));
		this.addChild(this.titleText);
		this.addChild(this.subTitleText);
        this.addChild(this.prev);
        this.addChild(this.next);

        let levelIndex = 0;
        while( LevelManager.getInstance().hasNext() ) {
            let entry = new ListEntry(levelIndex, 130, 220);
            entry.setCallbackOnClick(this.useSelectedGame.bind(this));
            entry.setOpacity(0.8);
            this.listComponents.push(entry);
            LevelManager.getInstance().next();
            levelIndex++;
            //this.addChild(entry);
        }
        LevelManager.getInstance().setCurrentLevel(0);
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
	onResetEvent() {
		this.replay = new ChooserComponent();
		game.world.addChild(this.replay);

		//input.bindPointer(input.pointer.LEFT, input.KEY.ESC);

		this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "exit") {
				state.change(state.MENU);
			}
		});

	}

	onDestroyEvent() {
		event.off(event.KEYDOWN, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.replay);
        //LevelManager.getInstance().reset();
	}
}