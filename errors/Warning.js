class Warning extends Error {
    constructor (msg) {
        super(msg);
        this.message = msg;
        this.name = 'Warning';
        this.level = 'warn';
        this.exit = false;
    }
}

module.exports = Warning;
