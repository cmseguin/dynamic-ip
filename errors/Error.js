class cError extends Error {
    constructor (msg) {
        super(msg);
        this.message = msg;
        this.name = 'Error';
        this.level = 'error';
    }
}

module.exports = cError;
