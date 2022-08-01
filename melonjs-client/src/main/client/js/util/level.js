import { level, loader } from "melonjs/dist/melonjs.module.js";
import CONFIG from "../../config";

export class Level {
    constructor(info, name, longName, data) {
        this.info = info;
        this.id = info.id;
        this.name = name;
        this.longName = longName;
        this.data = data; 
        this.description = data.description;
        this.loadedIntoMelon = false;
    }

    loadIntoMelon() {
        if( !this.loadedIntoMelon ) {
            loader.load(
                {name: this.id, src: this.info.path, type: 'tmx', format: 'json', data: this.data},
                this.onLoaded
            );

            this.loadedIntoMelon = true;      
        }
    }

    onLoaded() {  
    }
}

var levelManager = null; 

const LEVEL_NAMES = [
	// GUIDs from manifest.js
	{ id: "level1", path: "maps/0.json", loaded: false, error: false },
	{ id: "level2", path: "maps/1.json", loaded: false, error: false },
	{ id: "level3", path: "maps/2.json", loaded: false, error: false },
	{ id: "level4", path: "maps/3.json", loaded: false, error: false },
	{ id: "level5", path: "maps/4.json", loaded: false, error: false },
	{ id: "level6", path: "maps/5.json", loaded: false, error: false },
];

export class LevelManager {
    allLevels = [];
    currentLevel = 0;
    levelChangeListeners = [];

    constructor() {        
    }

    /**
     * 
     * @returns the main instance of LevelManager
     */
    static getInstance() {
        if( levelManager == null ) {
            console.log("Creating LevelManager instance");
            levelManager = new LevelManager();
        }
        return levelManager;
    }

    async _loadLevelData(info) {
        let url = CONFIG.baseURL + info.path;
        let myThis = this;
        console.log("  LevelManager: Loading level '" + info.id + "'");

        let res = await fetch(url);
        let data = await res.json();
        let level = new Level(info, data.name, data.longName, data);
        console.log("  Loaded: " + info.id);
        this.allLevels[info.id] = level;
        return level;
    }

    /**
     * Initialize the LevelManager and load all levels as JSON into memory. 
     * 
     * @param {*} callback, called when all levels are loaded asynchronously
     */
    initialize(callback) {
        const promises = [];
        for (let i = 0; i < LEVEL_NAMES.length; i++) {
            let info = LEVEL_NAMES[i];
            promises.push(this._loadLevelData(LEVEL_NAMES[i]));
        }

        Promise.all(promises).then((res) => {
            console.log("  All Levels loaded: " + res);
            callback();
        })
        .catch(function(err) {
            console.log("  LevelManager: Failed loading level " + err);
        });
    }

    addLevelChangeListener(callback) {
        this.levelChangeListeners.push(callback);
    }

    async _fireLevelChanged(oldLevel, newLevel) {
        this.levelChangeListeners.forEach((l) => {
            l(oldLevel, newLevel);
        });
    }

    /**
     * 
     * @returns the current level information
     */
    getCurrentLevel() {
        let levelId = LEVEL_NAMES[this.currentLevel].id;
        return this.allLevels[levelId];
    }

    getCurrentLevelId() {
        let levelId = LEVEL_NAMES[this.currentLevel].id;
        return levelId;
    }

    getCurrentLevelIndex() {
        return this.currentLevel;
    }

    /**
     * reset the current level info
     */
    reset() {
        console.log("  LevelManager.reset() ");
        this.currentLevel = 0;
    }

    /**
     * Set the current level index. This is mainly being used
     * by the replay feature.
     * 
     * @param {int} lvl current level index
     */
    setCurrentLevel(lvl) {
        this.currentLevel = lvl;
    }

    /**
     * 
     * @returns the next level or the 0th one.
     */
    next() {
        console.log("  LevelManager.next() ");        
        let oldLevel = this.currentLevel;
        this.currentLevel++;
        if( this.currentLevel > LEVEL_NAMES.length) {
            this.reset();
        }
        this._fireLevelChanged(oldLevel, this.currentLevel);        
    }

    /**
     * 
     * @returns the previous level or the 0th one.
     */
    prev() {
        console.log("  LevelManager.prev() ");
        let oldLevel = this.currentLevel;
        this.currentLevel--;
        if( this.currentLevel < 0 ) {
            this.reset();
        }
        this._fireLevelChanged(oldLevel, this.currentLevel);        
    }

    hasNext() {        
        if (this.currentLevel < LEVEL_NAMES.length) return true;
        return false;
    }

    prepareCurrentLevel() {
        let l = this.getCurrentLevel();
        console.log("  LevelManager.prepareCurrentLevel('" + this.getCurrentLevelId() + "')");        
        l.loadIntoMelon();
        level.load(l.id);
    }
}