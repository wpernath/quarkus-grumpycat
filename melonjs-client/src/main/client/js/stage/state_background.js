import { Container, game, Sprite, loader, BitmapText, Vector2d } from "melonjs";
import MultiplayerManager from "../util/multiplayer";

export class StateBackground extends Container {
	constructor(title, drawRightCat = true, drawLeftCat = true, drawMultiplayerName = false) {
		super(0,0,game.viewport.width, game.viewport.height);

		// make sure we use screen coordinates
		this.floating = true;

		// always behind any other
		this.z = 0;

		this.setOpacity(1.0);

		// give a name
		this.name = "Background";
		this.transparent = true;
		
		// new sprite for the title screen, position at the center of the game viewport
		this.backgroundImage = new Sprite(game.viewport.width / 2, game.viewport.height / 2, {
			image: loader.getImage("sensa_grass"),
		});

		// scale to fit with the viewport size
		this.backgroundImage.scale(game.viewport.width / this.backgroundImage.width, game.viewport.height / this.backgroundImage.height);
		this.backgroundImage.setOpacity(0.3);		

		if( drawLeftCat ) {
			this.catLeftImage = new Sprite(5, game.viewport.height - 300, {
				image: loader.getImage("grumpy_cat_right"),
				anchorPoint: new Vector2d(0, 0),
			});
		}

		if( drawRightCat ) {
			this.catRightImage = new Sprite(game.viewport.width - 180, game.viewport.height - 300, {
				image: loader.getImage("grumpy_cat_left"),
				anchorPoint: new Vector2d(0, 0),
			});
		}
		this.titleImage = new Sprite(86, 0, {
			image: loader.getImage("title"),
			anchorPoint: new Vector2d(0, 0),
		});
		this.titleImage.pos.x = (game.viewport.width - this.titleImage.width) / 2;

		this.subTitleText = new BitmapText(126, 170, {
			font: "Shadow",
			fillStyle: "white",
			textAlign: "left",
			text: title,			
		});
		this.subTitleText.pos.x = this.titleImage.pos.x + 40;

		if( drawMultiplayerName ) {
			this.addChild(
				new BitmapText(this.titleImage.pos.x + this.titleImage.width - 20, 170, {
					font: "24Outline",
					textAlign: "right",
					text: MultiplayerManager.get().multiplayerPlayer.name,
				})
			);
		}

		// add to the world container
		this.addChild(this.backgroundImage, 0);
		if( drawLeftCat ) {
			this.addChild(this.catLeftImage, 5);
		}
		
		if( drawRightCat ) {
			this.addChild(this.catRightImage, 5);
		}
		this.addChild(this.titleImage, 2);
		this.addChild(this.subTitleText, 5);
	}
}