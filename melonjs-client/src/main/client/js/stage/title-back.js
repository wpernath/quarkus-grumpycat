import { Container, Sprite, Text, game, loader, Vector2d, BitmapText, Tween } from "melonjs/dist/melonjs.module.js";
import CONFIG from "../../config";
import GlobalGameState from "../util/global-game-state";


class TextScroller extends BitmapText {
    constructor(text) {
        super(0, game.viewport.height - 40, {
			font: "ArialFancy", 
			textAlign: "left", 
			fillStyle: "white",
			size: 1.5,
			text: text
		});

		this.textWidth = this.measureText().width;
        this.scrollingText = text;
        this.scrollerpos = game.viewport.width;

        this.scrollertween = new Tween(this)
            .to({ scrollerpos: -this.textWidth }, 20000)
			.repeat(Infinity)
            .start();
    }

	onDestroyEvent() {		
		this.scrollertween.stop();
	}

	repeatScrolling() {
		this.scrollerpos = game.viewport.width;
		this.scrollertween.to({ scrollerpos: -this.textWidth }, 0).onComplete(this.repeatScrolling.bind(this)).start();	}

    update(dt) {
		this.pos.x = Math.round(this.scrollerpos);
        return true;
    }

}

export default class TitleBackground extends Container {
	
    constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleBack";

		// a tween to animate the text
		// new sprite for the title screen, position at the center of the game viewport
		this.backgroundImage = new Sprite(game.viewport.width / 2, game.viewport.height / 2, {
			image: loader.getImage("sensa_grass"),
		});

		// scale to fit with the viewport size
		this.backgroundImage.scale(game.viewport.width / this.backgroundImage.width, game.viewport.height / this.backgroundImage.height);
		this.backgroundImage.setOpacity(0.3);

		this.catLeftImage = new Sprite(5, game.viewport.height - 300, {
			image: loader.getImage("grumpy_cat_right"),
			anchorPoint: new Vector2d(0, 0),
		});
		this.catRightImage = new Sprite(game.viewport.width - 180, game.viewport.height - 300, {
			image: loader.getImage("grumpy_cat_left"),
			anchorPoint: new Vector2d(0, 0),
		});

		this.titleText = new Sprite(86, 0, {
			image: loader.getImage("title"),
			anchorPoint: new Vector2d(0,0)
		});
		

		this.subTitleText = new BitmapText(126, 170, {
			font: "12Outline",
			size: "1",
			fillStyle: "white",
			textAlign: "left",
			text: "A JavaScript / melonJS client. Written by Wanja Pernath",
			offScreenCanvas: false,
		});

		this.subVersionText = new BitmapText(126, 186, {
			font: "12Outline",
			size: "1",
			fillStyle: "white",
			textAlign: "left",
			text: "Server API: " + GlobalGameState.globalServerVersion.appName + "@" + GlobalGameState.globalServerVersion.appVersion + " at " + CONFIG.baseURL,
			offScreenCanvas: false,
		});

		// add to the world container
		this.addChild(this.backgroundImage, 0);
		this.addChild(this.catLeftImage, 5);
		this.addChild(this.catRightImage, 5);
		this.addChild(this.titleText,2);

		this.addChild(this.subTitleText,5 );
		this.addChild(this.subVersionText, 5);

		this.addChild( new TextScroller(
			"QUARKUS GRUMPYCAT. A GAME WRITTEN BY WANJA PERNATH, INSPIRED BY FAT CAT AND PAC MAN. THIS GAME IS USING A QUARKUS BACKEND TO LOAD AND STORE DATA FROM/TO A SERVER................................"
		));
	}

}