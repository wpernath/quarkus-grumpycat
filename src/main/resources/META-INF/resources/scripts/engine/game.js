import {TiledMapRenderer} from './game-tiled-renderer.js';


export const DEVICE_TYPE = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
};

export class Font {

    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
}


export class GameEngine {
    fonts;
    deviceType;
    canvas; 
    context;
    width;
    height;
    renderer;
    fonts = [];

    constructor(canvas) {
        this.canvas  = canvas;
        this.context = canvas.getContext("2d");
        this.width   = canvas.width;
        this.height  = canvas.height;
        this.fonts   = [];

        // calculate font sizes
        if( this.height < 400 ) {
            this.deviceType = DEVICE_TYPE.SMALL;
            this.fonts.push(new Font("small", 12));
            this.fonts.push(new Font("headline", 40) );
            this.fonts.push(new Font("menu", 24));
        }
        else if( this.height > 400 && this.height < 800) {
            this.deviceType = DEVICE_TYPE.MEDIUM;
            this.fonts.push(new Font("small", 16));
            this.fonts.push(new Font("headline", 52));
            this.fonts.push(new Font("menu", 30));
        }
        else {
            this.deviceType = DEVICE_TYPE.LARGE;
            this.fonts.push(new Font("small", 16));
            this.fonts.push(new Font("headline", 66));
            this.fonts.push(new Font("menu", 40));
        }
    }

    initMap() {
        
    }
    getFont(name) {
        for( let i = 0; i < this.fonts.length; i++ ) {
            if( this.fonts[i].name == name) {
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
    	let x = (this.canvas.width-width)/2;
	    this.context.fillText(text, x, y);
	    return x;
    }

}