import { Stage, event, loader, game, state, Vector2d, Text, Container, BitmapText, Rect, Sprite, input } from "melonjs/dist/melonjs.module.js";
import GlobalGameState from "../util/global-game-state";
import CONFIG from "../../config";
import NetworkManager from "../util/network";

class HighscoreEntry extends Container {
    font;
    scoreEntry;
    nameText;
    dateText;
    scoreText;

    constructor(score, pos, x,y, w) {
        super(x,y, w, 32);
        this.scoreEntry = score;
		this.position = pos;

		this.posFont = new BitmapText(x, y, {
			font: "24Outline",
			size: 1,
			text: pos.toString().padStart(2, '0') + ".",
			anchorPoint: new Vector2d(0, 0),
		});

        this.nameFont = new BitmapText(x, y, {
            font: "24Outline",
            size: 1,            
            text: "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
            anchorPoint: new Vector2d(0,0)
        });

        this.dateFont = new BitmapText(x + 200, y, {
					font: "24Outline",
					size: 1,					
					text: this.scoreEntry.time,
					anchorPoint: new Vector2d(0, 0),
				});

        this.scoreFont = new BitmapText(x + 350, y, {
					font: "24Outline",
					size: 1,
					fillStyle: "#ffffff",
					text: this.scoreEntry.score,
                    textAlign: "left",
					anchorPoint: new Vector2d(0, 0),
				});
        
        this.fontSize = this.nameFont.measureText();
        super.setShape(x, y, w, this.fontSize.height + 16);
        this.border = new Rect(x, y, w, this.fontSize.height + 16);
        
		this.posFont.pos.x += 8;
		this.posFont.pos.y += 8;

        this.nameFont.pos.x += 48;
        this.nameFont.pos.y += 8;
        
        this.dateFont.pos.x += 200;
        this.dateFont.pos.y += 8;

        this.scoreFont.pos.x += 320;
        this.scoreFont.pos.y += 8;

        this.setName("Wanja Pernath");
        this.setTime(this.scoreEntry.time);
        this.setScore(this.scoreEntry.score);
		this.posText = pos.toString().padStart(2, "0") + ".";
        console.log("(" + x + ", " + y + ", " + w + ", " + (this.fontSize.height + 16) + ")");
    }


    draw(renderer) {
        renderer.setGlobalAlpha(0.5);
        renderer.setColor("#008800");
        renderer.fill(this.border);

        renderer.setGlobalAlpha(1);
        renderer.setColor("#000000");
        renderer.stroke(this.border);
        
        renderer.setColor("#ffffff");
		this.posFont.draw(renderer, this.posText, this.posFont.pos.x, this.posFont.pos.y);
        this.nameFont.draw(renderer, this.nameText, this.nameFont.pos.x, this.nameFont.pos.y);
        this.dateFont.draw(renderer, this.dateText, this.dateFont.pos.x, this.dateFont.pos.y);
        this.scoreFont.draw(renderer, this.scoreText, this.scoreFont.pos.x, this.scoreFont.pos.y);

    }

    setName(text) {
        this.nameText = text;
        this.isDirty  = true;
    }

    setTime(time) {
        this.dateText = new Date(time).toLocaleDateString();
        this.isDirty = true;
    }

    setScore(score) {
        this.scoreText = score.toString().padStart(7, "0");
        this.isDirty = true;
    }

    updateScoreEntry(score) {
        this.scoreEntry = score;
        this.setName(score.name);
        this.setTime(score.time);
        this.setScore(score.score);
    }
}

class HighscoreComponent extends Container {
	highscoreComponent = [];
	highscores = [
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 100000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 90000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 80000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 70000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 60000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 50000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 40000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 30000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 20000, time: new Date(Date.now()) },
		{ pos: 0, name: "Wanja Pernath", playerId: 1, gameId: 2, score: 10000, time: new Date(Date.now()) },
	];

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
			text: "HIGHSCORES",
			offScreenCanvas: false,
		});

		this.addChild(this.titleText);
		this.addChild(this.subTitleText);

		// write the highest 10 scores
		for (let i = 0; i < this.highscores.length; i++) {
			let se = this.highscores[i];
			let comp = new HighscoreEntry(se, i + 1, 50, 250 + 42 * i, game.viewport.width - 100, 36);
			this.highscoreComponent.push(comp);
			this.addChild(comp);
		}
	}

	updateHighscores(scores) {
		if (scores == null || scores.length == 0) {
			scores = this.highscores;
		}

		for (let i = 0; i < scores.length; i++) {
			let score = scores[i];
			this.highscoreComponent[i].updateScoreEntry(score);
		}

		console.log(scores);
	}
}

export default class HighscoreScreen extends Stage {
    onResetEvent() {

        this.highscore = new HighscoreComponent();
        game.world.addChild(this.highscore);

		input.bindPointer(input.pointer.LEFT, input.KEY.ESC);

        this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
            if (!state.isCurrent(state.SCORE)) return;
            if (action === "exit") {
                state.change(state.MENU);
            }
        });

		NetworkManager.getInstance().readTop10Highscores()
			.then((out) => this.highscore.updateHighscores(out))
			.catch((err) => console.log(err));
    }

    onDestroyEvent() {
        event.off(event.KEYDOWN, this.handler);
		input.unbindPointer(input.pointer.LEFT);
        game.world.removeChild(this.highscore);
    }
}