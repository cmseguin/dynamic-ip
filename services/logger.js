const path = require('path');
const winston = require('winston');
const dateFormat = require('dateformat');
const config = require('./config');

let transports = [];

if (config.get('debug') === true) {
    transports.push(new (winston.transports.Console)({
        formatter: function(options) {
            let now = new Date();
            let prefix = `[${dateFormat(now, "yyyy-mm-dd HH:MM:ss")}]`;
            let message = options.message || '';
            let meta = (options.meta && Object.keys(options.meta).length) ? '\n\t' + JSON.stringify(options.meta) : ''

            return `${prefix} ${message} ${meta}`;
        }
    }));
} else {
    transports.push(new (winston.transports.File)({
        filename: path.join('../', config.get('logDestination'), 'stdout.log')
    }));
}

const logger = new (winston.Logger)({
    transports: transports
});

module.exports = logger;
