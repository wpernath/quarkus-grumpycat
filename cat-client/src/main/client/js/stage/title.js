import { Stage, game, device, input, Sprite, event, state, Body, collision, level, Tile, Rect, loader, Vector2d, video} from 'melonjs/dist/melonjs.module.js';
import TitleBackground from './title-back';
import GlobalGameState from '../util/global-game-state';
import TitleMenu from './title-menu';
import { LevelManager } from '../util/level';

export default class TitleScreen extends Stage {

	/**
	 *  action to perform on state change
	 */
	onResetEvent() {
		console.log("Title.OnEnter()");
		
		// Reset GlobalGameState
		GlobalGameState.reset();		
		
		this.background = new TitleBackground();
		this.menu = new TitleMenu();
		game.world.addChild(this.background);
		game.world.addChild(this.menu);


        this.handler = event.on(event.KEYUP, (action, keyCode, edge) => {
			if (!state.isCurrent(state.MENU)) return;
			if (action === "pause") {
				if (!state.isPaused()) {
					state.pause();
				} else {
					state.resume();
				}
			}
			if (action === "bomb") {
				state.change(state.READY);
			}
			if( action === 'fullscreen') {
				if( !device.isFullscreen ) {
					device.requestFullscreen();
				}
				else {
					device.exitFullscreen();
				}
			}
		});
	}

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent() {
		console.log("Title.OnExit()");
		game.world.removeChild(this.background);
		game.world.removeChild(this.menu);
		event.off(event.KEYUP, this.handler);
		
	}
}
