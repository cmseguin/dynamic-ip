class Notice extends Error {
    constructor (msg) {
        super(msg);
        this.message = msg;
        this.name = 'Notice';
        this.level = 'info';
        this.exit = false;
    }
}

module.exports = Notice;
