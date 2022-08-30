import { Stage, game, event, state, Container, input, BitmapText, RoundRect, Rect } from "melonjs";
import { my_state } from "../util/constants";
import { StateBackground } from "./state_background";
import BaseTextButton from "../util/base-text-button";
import BaseTerrainSprite from "../renderables/terrain/terrain-sprite";
import { BONUS_TILE } from "../util/constants";

class KeyHelpComponent extends Container {
    constructor(x,y,w,h) {
        super(x,y,w,h);

        this.header = new BitmapText(4, 4, {
            font: '18Outline',
            fillStyle: '#ff0000',
            textAlign: 'left',
            //textBaseline: 'top',
            text: "Keyboard controls",
        });

        this.border = new RoundRect(x, y, w, h);
        this.divider= new Rect(x+5, y+30, w-10, 2);
        let textL =
					"W | UP: \n" +
					"A | LEFT: \n" +
					"D | RIGHT: \n" +
					"S | DOWN: \n" +
					"P: \n" +
					"space: \n" +
					"Q: \n" +
					"E: \n" +
					"R: \n" +
					"shift + movement: \n" +
					"alt + movement:"; 

        let textR =
					"Move UP \n" +
					"Move LEFT\n" +
					"Move RIGHT\n" +
					"Move DOWN\n" +
					"Pause / Unpause\n" +
					"Place a bomb \n" +
					"Magic Firestorm\n" +
					"Magic protection circle \n" +
					"Magic Nebula \n" +
					"Place a barrier in the corresponding direction\n" +
					"Throw a magic bolt into the direction";

        this.keys = new BitmapText(4, 46, {            
            font: "12Outline",
            textAlign: "left",
            lineHeight: "1.5",
            text: textL
        });

        this.description = new BitmapText(124, 46, {
            font: "12Outline",
            textAlign: "left",
            lineHeight: "1.5",
            text: textR,
        });
        
        this.addChild(this.header);
        this.addChild(this.keys);
        this.addChild(this.description);

        this.header.pos.x = (w - this.header.measureText().width ) / 2;
    }

    draw(renderer, viewport) {
		renderer.setGlobalAlpha(0.3);
		renderer.setColor("#008800");
		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor("#000000");
		renderer.stroke(this.divider);
		renderer.stroke(this.border);
		renderer.setColor("#ffffff");
		renderer.fill(this.divider);
        super.draw(renderer, viewport);
    }
}


class BonusHelpComponent extends Container {
	constructor(x, y, w, h) {
		super(x, y, w, h);

		this.header = new BitmapText(4, 4, {
			font: "18Outline",
			fillStyle: "#ff0000",
			textAlign: "left",
			//textBaseline: 'top',
			text: "Collectable Bonus items",
		});

		this.border = new RoundRect(x, y, w, h);
		this.divider = new Rect(x + 5, y + 30, w - 10, 2);

		let textR =
            "A pill. You need to eat all of them to win.\n" +
            "A Chest. Open it and get a jackpot!\n\n" +
            "A Bomb. Adds 5 more bombs to your inventory \n" +
            "A "

		this.description = new BitmapText(44, 46, {
			font: "12Outline",
			textAlign: "left",
			lineHeight: "2",
			text: textR,
		});

        this.pillImg = new BaseTerrainSprite(20, 50, [BONUS_TILE.cactus -1], true);
        this.chestImg= new BaseTerrainSprite(20, 78, [BONUS_TILE.closedChest-1], true);
		this.bombImg = new BaseTerrainSprite(20, 110, [BONUS_TILE.bomb0 - 1], true);
		this.boltImg = new BaseTerrainSprite(20, 142, [BONUS_TILE.magicBolt - 1], true);
		this.fireImg = new BaseTerrainSprite(20, 174, [BONUS_TILE.magicFirespin - 1], true);
		this.nebuImg = new BaseTerrainSprite(20, 206, [BONUS_TILE.magicNebula - 1], true);
		this.protImg = new BaseTerrainSprite(20, 238, [BONUS_TILE.magicProtectionCircle - 1], true);

        this.addChild(this.pillImg);
        this.addChild(this.chestImg);
        this.addChild(this.bombImg);
        this.addChild(this.boltImg);
        this.addChild(this.fireImg);
        this.addChild(this.nebuImg);
        this.addChild(this.protImg);

		this.addChild(this.header);
		this.addChild(this.description);

		this.header.pos.x = (w - this.header.measureText().width) / 2;
	}

	draw(renderer, viewport) {
		renderer.setGlobalAlpha(0.3);
		renderer.setColor("#008800");
		renderer.fill(this.border);
		renderer.setGlobalAlpha(1);
		renderer.setColor("#000000");
		renderer.stroke(this.divider);
		renderer.stroke(this.border);
		renderer.setColor("#ffffff");
		renderer.fill(this.divider);
		super.draw(renderer, viewport);
	}
}

class KeyboardButton extends BaseTextButton {
    constructor(x, y, w, h, callback) {
        super(x,y, {
            font: '18Outline',
            text: "Controls",
            borderWidth: w,
            onClick: callback,
        });
    }
}

class BonusButton extends BaseTextButton {
	constructor(x, y, w, h, callback) {
		super(x, y, {
			font: "18Outline",
			text: "Collectables",
			borderWidth: w,
			onClick: callback,
		});
	}
}

class MenuComponent extends Container {
    static helps = {
        CONTROLS: 0,
        BONUS: 1,
    };

	constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
        this.helpScreen = MenuComponent.helps.CONTROLS;

		this.name = "TitleBack";
        let x = (game.viewport.width - 400) / 2;
        let y = (game.viewport.height - 300) / 2;

        this.keysHelp = new KeyHelpComponent(x, y, 400, 300);
        this.bonusHelp = new BonusHelpComponent(x, y, 400, 300);

		this.addChild(new StateBackground("How to play", true, true));
        this.addChild(this.keysHelp);
        this.addChild(new KeyboardButton(x, y + 305, 128, 24, this.controlsClicked.bind(this)));
        this.addChild(new BonusButton(x + 140, y + 305, 128, 24, this.bonusClicked.bind(this)));
    }

    controlsClicked(event) {
        if( this.helpScreen !== MenuComponent.helps.CONTROLS) {
            this.removeChild(this.bonusHelp, true);
            this.addChild(this.keysHelp);
            this.helpScreen = MenuComponent.helps.CONTROLS;
        }
    }

    bonusClicked(event) {
        if( this.helpScreen !== MenuComponent.helps.BONUS) {
            this.removeChild(this.keysHelp, true);
	    	this.addChild(this.bonusHelp);
            this.helpScreen = MenuComponent.helps.BONUS;
        }
    }
}


export default class HowToPlayScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);

        //input.bindPointer(input.pointer.LEFT, input.KEY.ESC);
		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.HOW_TO_PLAY)) return;
			if (action === "exit") {
				state.change(state.MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYUP, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.menu);
	}
}
