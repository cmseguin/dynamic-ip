const fs = require('fs');
const path = require('path');
const winston = require('winston');
const dateFormat = require('dateformat');
const config = require('./config');

const transports = [];

if (config.get('debug') === true) {
    transports.push(new winston.transports.Console({
        'formatter': function formatter (options) {
            const now = new Date();
            const prefix = `[${dateFormat(now, 'yyyy-mm-dd HH:MM:ss')}]`;
            const message = options.message || '';
            const meta = options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '';

            return `${prefix} ${message} ${meta}`;
        }
    }));
} else {
    const logFile = 'stdout.log';
    const logDir = path.resolve(__dirname, '../', config.get('logDestination'));
    const logDest = path.join(logDir, logFile);

    if (!fs.existsSync(logDir)) {
        // Create the directory if it does not exist
        fs.mkdirSync(logDir);
    }

    transports.push(new winston.transports.File({
        'filename': logDest
    }));
}

const logger = new winston.Logger({
    transports
});

module.exports = logger;
