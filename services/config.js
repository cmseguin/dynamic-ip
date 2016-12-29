const extend = require('deep-extend');
const objHelper = require('../helpers/object');
const configFile = require('../config');
const localConfigFile = require('../config-local');

const SystemError = require('../errors/system-error');

const config = extend(configFile, localConfigFile);

module.exports = {
    'get': (key) => {
        // Store the type of all the properties
        const tk = typeof key;

        if (tk !== 'string') {
            throw new SystemError(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        return objHelper.access(config, key);
    },
    'has': (key) => {
        // Store the type of all the properties
        const tk = typeof key;

        if (tk !== 'string') {
            throw new SystemError(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        return typeof objHelper.access(config, key) !== 'undefined';
    }
};
