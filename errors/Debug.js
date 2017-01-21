class Notice extends Error {
    constructor (msg) {
        super(msg);
        this.message = msg;
        this.name = 'Debug';
        this.level = 'debug';
        this.exit = false;
    }
}

module.exports = Notice;
