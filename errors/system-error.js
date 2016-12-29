class SystemError extends Error {
    constructor (msg) {
        super(msg);
        this.message = msg;
        this.name = 'System Error';
        this.statusCode = 500;
    }
}

module.exports = SystemError;
