const EventEmitter = require('events');

class Queue extends EventEmitter {
    #data;

    constructor() {
        super();
        this.#data = [];
    }

    size() {
        return this.#data.length;
    }

    peak() {
        if (this.#data.length < 1) {
            return undefined;
        }

        return this.#data[this.#data.length-1]
    }

    pop() {
        return this.#data.pop();
    }

    push(value) {
        this.emit("pre-push", value)
        this.#data.push(value);
        this.emit("push", value)
    }
}

exports.Queue = Queue;