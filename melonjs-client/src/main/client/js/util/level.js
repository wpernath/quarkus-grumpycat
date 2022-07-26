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
                this.paul
            );

            this.loadedIntoMelon = true;      
        }
    }

    paul() {  
    }
}

var levelManager = null; 

const levels = [
	// GUIDs from manifest.js
	{ id: "level1", path: "maps/0.json", loaded: false, error: false },
	{ id: "level2", path: "maps/1.json", loaded: false, error: false },
	{ id: "level3", path: "maps/2.json", loaded: false, error: false },
	{ id: "level4", path: "maps/3.json", loaded: false, error: false },
	{ id: "level5", path: "maps/4.json", loaded: false, error: false },
];

export class LevelManager {
    allLevels = [];
    currentLevel = 0;

    _constructor() {        
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
        this.allLevels[level.id] = level;
        return level;
    }

    /**
     * Initialize the LevelManager and load all levels as JSON into memory. 
     * 
     * @param {*} callback, called when all levels are loaded asynchronously
     */
    initialize(callback) {
        const promises = [];
        for (let i = 0; i < levels.length; i++) {
            let info = levels[i];
            promises.push(this._loadLevelData(levels[i]));
        }

        Promise.all(promises).then((res) => {
            console.log("  All Levels loaded: " + res);
            callback();
        })
        .catch(function(err) {
            console.log("  LevelManager: Failed loading level " + err);
        });
    }

    /**
     * 
     * @returns the current level information
     */
    getCurrentLevel() {
        let levelId = levels[this.currentLevel].id;
        return this.allLevels[levelId];
    }

    getCurrentLevelId() {
        let levelId = levels[this.currentLevel].id;
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
     * 
     * @returns the next level or the 0th one.
     */
    next() {
        console.log("  LevelManager.next() ");
        this.currentLevel++;
        if( this.currentLevel > levels.length) {
            this.reset();
        }
        return this.getCurrentLevel();
    }

    /**
     * 
     * @returns the previous level or the 0th one.
     */
    prev() {
        console.log("  LevelManager.prev() ");
        this.currentLevel--;
        if( this.currentLevel < 0 ) {
            this.reset();
        }
        return this.getCurrentLevel();
    }

    hasNext() {        
        if( this.currentLevel < levels.length) return true;
        return false;
    }

    prepareCurrentLevel() {
        let l = this.getCurrentLevel();
        console.log("  LevelManager.prepareCurrentLevel('" + this.getCurrentLevelId() + "')");        
        l.loadIntoMelon();
        level.load(l.id);
    }
}