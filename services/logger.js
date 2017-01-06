const fs = require('fs');
const path = require('path');
const winston = require('winston');
const dateFormat = require('dateformat');
const config = require('./config');

const transports = [];
let level = 'warn';

if (config.get('debug') === true) {
    // When debug mode is one, we want to see info
    level = 'info';

    // Output to the console
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
    // Build log destination
    const logFile = 'stdout.log';
    const logDir = path.resolve(__dirname, '../', config.get('logDestination'));
    const logDest = path.join(logDir, logFile);

    // Make sure log folder exists
    if (!fs.existsSync(logDir)) {
        // Create the directory if it does not exist
        fs.mkdirSync(logDir);
    }

    // Output to a file
    transports.push(new winston.transports.File({
        'filename': logDest
    }));
}

const logger = new winston.Logger({
    level,
    transports
});

module.exports = logger;
