const logger = require('../services/logger');

module.exports = (e) => {
    if (e.exit === true) {
        throw e;
    }

    if (typeof e.level === 'string') {
        logger[e.level](e.message);
    } else {
        logger.error(e.message);
    }
};
