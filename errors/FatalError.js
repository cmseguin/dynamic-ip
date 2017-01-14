class FatalError extends Error {
    constructor (msg) {
        super(msg);
        this.message = msg;
        this.name = 'Fatal Error';
        this.level = 'error';
        this.exit = true;
    }
}

module.exports = FatalError;
