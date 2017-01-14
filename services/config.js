const extend = require('deep-extend');
const objHelper = require('../helpers/object');
const configFile = require('../config');
const localConfigFile = require('../config-local');

const Error = require('../errors/Error');

const config = extend(configFile, localConfigFile);

module.exports = {
    'get': (key) => {
        // Store the type of all the properties
        const tk = typeof key;

        if (tk !== 'string') {
            throw new Error(`Key is not valid.\nValue: ${key}\nType: ${tk}`);
        }

        return objHelper.access(config, key);
    },
    'has': (key) => {
        // Store the type of all the properties
        const tk = typeof key;

        if (tk !== 'string') {
            throw new Error(`Key is not valid.\nValue: ${key}\nType: ${tk}`);
        }

        return typeof objHelper.access(config, key) !== 'undefined';
    }
};
