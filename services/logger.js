const fs = require('fs');
const path = require('path');
const winston = require('winston');
const dateFormat = require('dateformat');
const config = require('./config');

const transports = [];

const mkdirSync = (p) => {
    try {
        fs.mkdirSync(p);
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
};

const mkdirpSync = (dirpath) => {
    const parts = dirpath.split(path.sep);

    for (let i = 1; i <= parts.length; i++) {
        mkdirSync(path.join.apply(null, parts.slice(0, i)));
    }
};

let level = 'info';

if (config.get('debug') === true) {
    // When debug mode is one, we want to see debug log
    level = 'debug';

    // Output to the console
    transports.push(new winston.transports.Console({
        'formatter': function formatter (options) {
            let meta = '';

            const now = new Date();
            const prefix = `[${dateFormat(now, 'yyyy-mm-dd HH:MM:ss')}]`;
            const message = options.message || '';

            // If we send meta informations. aka: an object...
            if (options.meta && Object.keys(options.meta).length) {
                meta = `\n\t${JSON.stringify(options.meta, null, 2)}`;
            }

            return `${prefix} ${message} ${meta}`;
        }
    }));
} else {
    // Build log destination
    const logFile = 'stdout.log';
    const logDir = path.resolve(__dirname, '../', config.get('logDestination'));
    const logDest = path.join(logDir, logFile);

    // Make sure log folder exists
    mkdirpSync(logDir);

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
