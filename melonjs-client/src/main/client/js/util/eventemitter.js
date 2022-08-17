export class EventEmitter {
    constructor() {
        this._events = {};
    }

    on(name, listener) {
        if( !this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(listener);
    }

    off(name, listenerToRemove) {
        if( !this._events[name]) {
            //throw new Error("Can't remove listener from event ${name}");
            return;
        }

        const filterListeners = (listener) => listener !== listenerToRemove;
        this._events[name] = this._events[name].filter(filterListeners);        
    }

    allOff(name) {
        if (this._events[name]) {
            this._events[name] = [];            
        }
    }

    emit(name, data) {
        if( !this._events[name] ) {
            //throw new Error("Can't emit listener from event ${name}");
            return;
        }

        this._events[name].forEach( (l) => {
            l(data);
        });
    }

    reset() {
        this._events = {};
    }
}