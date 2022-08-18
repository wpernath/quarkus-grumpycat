class Listener {
    constructor(fn, context, event) {
        this.fn = fn;
        this.context = context;
        this.event = event;
    }
}
export class EventEmitter {
    constructor() {
        this._events = {};
    }

    on(name, listener, context) {
        if( !this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(new Listener(listener, context, name));
    }

    off(name, listenerToRemove) {
        if( !this._events[name]) {
            //throw new Error("Can't remove listener from event ${name}");
            return;
        }
        
        this._events[name] = this._events[name].filter( (l) => {
            return l.fn !== listenerToRemove;
        });        
    }

    allOff(name) {
        if (this._events[name]) {
            this._events[name] = [];            
        }
    }

    emit(name, data) {
        if( !this._events[name] ) {
            //throw new Error("Can't emit listener from event ${name}");
            return false;
        }

        this._events[name].forEach( (l) => {
            l.fn.call(l.context, data);
        });
    }

    reset() {
        this._events = {};
    }
}