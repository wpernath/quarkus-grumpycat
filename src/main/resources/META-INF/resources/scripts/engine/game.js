const DEVICE_TYPE = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
};

class Font {

    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
}

class Video {
	fonts;
	deviceType;
	canvas;
	context;
	width;
	height;
	renderer;
	fonts = [];

    static checkForTouchScreen() {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
        let hasTouchScreen = false;
        if ("maxTouchPoints" in navigator) {
            hasTouchScreen = navigator.maxTouchPoints > 0;
        } else if ("msMaxTouchPoints" in navigator) {
            hasTouchScreen = navigator.msMaxTouchPoints > 0;
        } else {
            var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
            if (mQ && mQ.media === "(pointer:coarse)") {
                hasTouchScreen = !!mQ.matches;
            } else if ("orientation" in window) {
                hasTouchScreen = true; // deprecated, but good fallback
            } else {
                // Only as a last resort, fall back to user agent sniffing
                var UA = navigator.userAgent;
                hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
            }
        }
        return hasTouchScreen;
    }

	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;
		this.fonts = [];

		// calculate font sizes
		if (this.height < 400) {
			this.deviceType = DEVICE_TYPE.SMALL;
			this.fonts.push(new Font("small", 12));
			this.fonts.push(new Font("headline", 40));
			this.fonts.push(new Font("menu", 24));
		} else if (this.height > 400 && this.height < 800) {
			this.deviceType = DEVICE_TYPE.MEDIUM;
			this.fonts.push(new Font("small", 16));
			this.fonts.push(new Font("headline", 52));
			this.fonts.push(new Font("menu", 30));
		} else {
			this.deviceType = DEVICE_TYPE.LARGE;
			this.fonts.push(new Font("small", 16));
			this.fonts.push(new Font("headline", 66));
			this.fonts.push(new Font("menu", 40));
		}
	}

	getFont(name) {
		for (let i = 0; i < this.fonts.length; i++) {
			if (this.fonts[i].name == name) {
				return this.fonts[i];
			}
		}
		return this.fonts[0];
	}

	getSmallFont() {
		return this.getFont("small");
	}

	getHeadlineFont() {
		return this.getFont("headline");
	}

	getMenuFont() {
		return this.getFont("menu");
	}

	getDeviceType() {
		return this.deviceType;
	}

	clearScreen() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawCenteredText(text, y) {
		let width = this.context.measureText(text).width;
		let x = (this.canvas.width - width) / 2;
		this.context.fillText(text, x, y);
		return x;
	}
}


class GameStage {
    GAME_STATES;

    onEnter(time) {

    };
    onLeave(time) {

    };
    draw(){

    };
    update(time){

    };

}

const GAME_STATES = {
    TITLE: 0,
    PLAY: 1,
    GAME_OVER: 2,
    LEVEL_WON: 3,
    LEVEL_LOST:4
}

class GameEngine {
    video;
    renderer;
    gameWorld;
    gameStage;

    constructor(canvas) {
        this.canvas = canvas;
        this.context= canvas.getContext("2d");
        this.video  = new Video(canvas);
        this.renderer = new TiledMapRenderer(this.canvas);
    }


    initMap(map) {
        this.renderer = new TiledMapRenderer(this.canvas);        
        this.renderer.parse(map);
    }

}