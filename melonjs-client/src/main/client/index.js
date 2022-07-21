import {
    audio,
    loader,
    state,
    device,
    video,
    utils,
    game,
    plugin,
    pool,
    input,
    TextureAtlas
} from 'melonjs/dist/melonjs.module.js';

import 'index.css';

import TitleScreen from 'js/stage/title.js';
import PlayScreen from 'js/stage/play.js';
import GetReadyScreen from './js/stage/get-ready';
import GameOverScreen from './js/stage/game-over';
import HighscoreScreen from './js/stage/highscores';

import PlayerEntity from 'js/renderables/player.js';
import CatEnemy from "js/renderables/cat-enemy.js";
import { SpiderEnemy } from './js/renderables/spider-enemy';
import BombEntity from './js/renderables/bomb';
import DataManifest from 'manifest.js';

import CONFIG from 'config.js';
import GlobalGameState from './js/util/global-game-state';
import { LevelManager } from './js/util/level';
import NetworkManager from './js/util/network';




device.onReady(() => {

    // initialize the display canvas once the device/browser is ready
    //video.
    if (!video.init(1024, 768, { 
        parent: "screen", 
        scaleMethod: "fit", 
        renderer: video.AUTO, 
        subPixel: false, 
        doubleBuffering: true 
    })) {
		alert("Your browser does not support HTML5 canvas.");
		return;
	}

    // initialize the debug plugin in development mode.
    if (process.env.NODE_ENV === 'development') {
        import('js/plugin/debug/debugPanel.js').then((debugPlugin) => {
            // automatically register the debug panel
            utils.function.defer(plugin.register, this, debugPlugin.DebugPanelPlugin, "debugPanel");
        });
    }

    // Initialize the audio.
    audio.init("mp3,ogg");

    // allow cross-origin for image/texture loading
    let environment = CONFIG.environment;
    let baseURL;
    if (environment === "local") baseURL = CONFIG.local.baseURL;
		else if (environment === "dev") baseURL = CONFIG.dev.baseURL;
		else if (environment === "test") baseURL = CONFIG.test.baseURL;
		else if (environment === "prod") baseURL = CONFIG.prod.baseURL;
    
    loader.setBaseURL("tmx", baseURL);
    CONFIG.baseURL = baseURL;

    loader.crossOrigin = "anonymous";

    // initialize NetworkManager
    NetworkManager.getInstance();

    // Initialize LevelManager and read all levels
    LevelManager.getInstance().initialize(function() {
        console.log("  Levels are all loaded and initialized! ");

        // set and load all resources.
        loader.preload(DataManifest, function() {

            GlobalGameState.screenControlsTexture = new TextureAtlas(loader.getJSON("screen-controls"), loader.getImage("screen-controls"));

            // set the user defined game stages
            state.set(state.MENU, new TitleScreen());
            state.set(state.PLAY, new PlayScreen());
            state.set(state.READY, new GetReadyScreen());
            state.set(state.GAMEOVER, new GameOverScreen(true));
            state.set(state.GAME_END, new GameOverScreen(false));
            state.set(state.SCORE, new HighscoreScreen());

            // set the fade transition effect
            state.transition("fade", "#000000", 500);

            // add our player entity in the entity pool
            pool.register("player", PlayerEntity, true);
            pool.register("enemy", CatEnemy, false);
            pool.register("bomb", BombEntity, true);
            pool.register("spider", SpiderEnemy, true);

            // bind keys
            input.bindKey(input.KEY.SHIFT, "barrier");
            input.bindKey(input.KEY.LEFT, "left");
            input.bindKey(input.KEY.RIGHT, "right");
            input.bindKey(input.KEY.UP, "up");
            input.bindKey(input.KEY.E, "explode", true);
            input.bindKey(input.KEY.P, "pause", true);
            input.bindKey(input.KEY.DOWN, "down");
            input.bindKey(input.KEY.SPACE, "bomb", true);
            input.bindKey(input.KEY.ESC, "exit", true);
            input.bindKey(input.KEY.F, "fullscreen", true);
                
            NetworkManager.getInstance().createGameOnServer()
                .then(function() {
                    state.change(state.MENU);
                })
                .catch(function(err) {
                    console.log(err);
                })
        });
    });
});
