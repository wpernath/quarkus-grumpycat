import { Stage, game, event, state, Container, input, BitmapText, RoundRect, Rect } from "melonjs";
import { ENEMY_TILE, my_state } from "../util/constants";
import { StateBackground } from "./state_background";
import BaseTextButton from "../util/base-text-button";
import BaseTerrainSprite from "../renderables/terrain/terrain-sprite";
import { BONUS_TILE } from "../util/constants";

class BaseHelpComponent extends Container {
	constructor(x, y, w, h, title) {
		super(x, y, w, h);

		this.header = new BitmapText(4, 4, {
			font: "18Outline",
			fillStyle: "#ff0000",
			textAlign: "left",
			text: title,
		});

		this.border = new RoundRect(x, y, w, h);
		this.divider = new Rect(x + 5, y + 30, w - 10, 2);

		this.header.pos.x = (w - this.header.measureText().width) / 2;
		this.addChild(this.header);
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
class KeyHelpComponent extends BaseHelpComponent {
    constructor(x,y,w,h) {
        super(x,y,w,h, "Keyboard Controls");

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
                
        this.addChild(this.keys);
        this.addChild(this.description);
    }
}

class EnemiesHelpComponent extends BaseHelpComponent {
	constructor(x, y, w, h) {
		super(x, y, w, h, "Your Enemies");

		let textR =
			"A nasty cat. She will follow you whereever you are.\n" +
			"  She hurts you by 10 hit points. \n" +
			"  Damage will stunn the cat for 5sec.\n" +
			"  A magic nebula is supposed to be a good weapon\n" +
			"  Best strategy: Lock her up!\n\n" +

			"A spider. They come in hordes and they are fast!.\n"+
			"  They hurt you by 25 hit points.\n"+
			"  Damage will kill the spider.\n"+
			"  A magic nebula is supposed to be the best weapon\n"+
			"  Best strategy: Kill them all!\n\n" +

			"A golem. They are stupid and follow their path.\n"+
			"  They hurt you by 50 hit points. Be careful!\n"+
			"  Damage will stunn them for 5sec. \n"+
			"  There is no weapon, except stunning them!\n"+
			"  Best strategy: Don't get in touch with them!\n";

		this.description = new BitmapText(44, 46, {
			font: "12Outline",
			textAlign: "left",
			lineHeight: 1.5,
			text: textR,
		});

		this.catImg = new BaseTerrainSprite(20, 80, [ENEMY_TILE.cat - 1], true);
		this.spiderImg = new BaseTerrainSprite(20, 190, [ENEMY_TILE.spider - 1], true);
		this.golemImg = new BaseTerrainSprite(20, 310, [ENEMY_TILE.golem - 1], true);
		
		this.addChild(this.description);
		this.addChild(this.catImg);
		this.addChild(this.spiderImg);
		this.addChild(this.golemImg);
	}
}

class BonusHelpComponent extends BaseHelpComponent {
	constructor(x, y, w, h) {
		super(x, y, w, h, "Collectable Bonus items");

		let textR =
            "A pill. You need to eat all of them to win.\n" +
            "A Chest. Open it and get a jackpot!\n" +
            "A Bomb. Adds 5 more bombs to your inventory \n" +
			"Meat! You get 25 points more energy \n" +
			"Cheese! You get 20 points more energy \n" +
            "Potion of Bolts. Adds 3 magic bolts to your inventory \n"+
			"Potion of Fire. Adds 3 magic firespins to your inventory \n"+
			"Potion of Nebula. Adds 3 magic nebulas to your inventory \n"+
			"Potion of Protection. Adds 3 magic protections to your inventory\n"

		this.description = new BitmapText(44, 46, {
			font: "12Outline",
			textAlign: "left",
			lineHeight: 2.5,
			text: textR,
		});

        this.pillImg = new BaseTerrainSprite(20, 50, [BONUS_TILE.cactus -1], true);
        this.chestImg= new BaseTerrainSprite(20, 78, [BONUS_TILE.closedChest-1], true);
		this.bombImg = new BaseTerrainSprite(20, 110, [BONUS_TILE.bomb0 - 1], true);
		this.meatImg = new BaseTerrainSprite(20, 142, [BONUS_TILE.meat-1], true);
		this.cheeseImg = new BaseTerrainSprite(20, 174, [BONUS_TILE.cheese-1], true);
		this.boltImg = new BaseTerrainSprite(20, 206, [BONUS_TILE.magicBolt - 1], true);
		this.fireImg = new BaseTerrainSprite(20, 238, [BONUS_TILE.magicFirespin - 1], true);
		this.nebuImg = new BaseTerrainSprite(20, 270, [BONUS_TILE.magicNebula - 1], true);
		this.protImg = new BaseTerrainSprite(20, 302, [BONUS_TILE.magicProtectionCircle - 1], true);

        this.addChild(this.pillImg);
        this.addChild(this.chestImg);
        this.addChild(this.bombImg);
		this.addChild(this.meatImg);
		this.addChild(this.cheeseImg);
        this.addChild(this.boltImg);
        this.addChild(this.fireImg);
        this.addChild(this.nebuImg);
        this.addChild(this.protImg);

		this.addChild(this.description);
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

class EnemyButton extends BaseTextButton {
	constructor(x, y, w, h, callback) {
		super(x, y, {
			font: "18Outline",
			text: "Enemies",
			borderWidth: w,
			onClick: callback,
		});
	}
}

class BackButton extends BaseTextButton {
	constructor(x, y, w, h, callback) {
		super(x, y, {
			font: "18Outline",
			text: "Back",
			borderWidth: w,
			onClick: callback,
		});
	}
}


class MenuComponent extends Container {
    static helps = {
        CONTROLS: 0,
        BONUS: 1,
		ENEMIES: 2,
    };


	constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.helpScreens = [];
        this.helpScreen = MenuComponent.helps.CONTROLS;

		this.name = "TitleBack";
		let w = 420;
		let h = 380;
        let x = (game.viewport.width - w) / 2;
        let y = (game.viewport.height - h) / 2 + 40;

        this.keysHelp = new KeyHelpComponent(x, y, w, h);
        this.bonusHelp = new BonusHelpComponent(x, y, w, h);
		this.enemiesHelp = new EnemiesHelpComponent(x, y, w, h);
		this.helpScreens.push(this.keysHelp);
		this.helpScreens.push(this.bonusHelp);
		this.helpScreens.push(this.enemiesHelp);

		this.addChild(new StateBackground("How to play", true, true));
        this.addChild(this.keysHelp);

        this.addChild(new KeyboardButton(x, y + h + 5, 128, 24, this.controlsClicked.bind(this)));
        this.addChild(new BonusButton(x + 140, y + h + 5, 128, 24, this.bonusClicked.bind(this)));
		this.addChild(new EnemyButton(x + 280, y + h + 5, 128, 24, this.enemiesClicked.bind(this)));
		this.addChild(new BackButton(x, y + h + 42, w, 24, this.backClicked.bind(this)));
    }

	backClicked(event) {
		state.change(state.MENU);
	}

	enemiesClicked(event) {
        if (this.helpScreen !== MenuComponent.helps.ENEMIES) {
			this.removeChild(this.helpScreens[this.helpScreen], true);
			this.addChild(this.enemiesHelp);
			this.helpScreen = MenuComponent.helps.ENEMIES;
		}
	}

    controlsClicked(event) {
        if( this.helpScreen !== MenuComponent.helps.CONTROLS) {
            this.removeChild(this.helpScreens[this.helpScreen], true);
            this.addChild(this.keysHelp);
            this.helpScreen = MenuComponent.helps.CONTROLS;
        }
    }

    bonusClicked(event) {
        if( this.helpScreen !== MenuComponent.helps.BONUS) {
            this.removeChild(this.helpScreens[this.helpScreen], true);
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
