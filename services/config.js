const extend = require('deep-extend');
const objHelper = require('../helpers/object');
const configFile = require('../config');

let localConfigFile;

try {
    localConfigFile = require('../config-local');
} catch (e) {
    localConfigFile = {};
}

let config = extend(configFile, localConfigFile);

module.exports = {
    get: (key) => {
        return objHelper.access(config, key);
    },
    has: (key) => {
        return (typeof objHelper.access(config, key) !== 'undefined')
    }
};
