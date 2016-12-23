const objHelper = require('../helpers/object');
const configFile = require('../config')

module.exports = {
    get: (key) => {
        return objHelper.access(configFile, key);
    },
    has: (key) => {
        return (typeof objHelper.access(configFile, key) !== 'undefined')
    }
};
