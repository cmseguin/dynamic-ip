const fs = require('fs');
const path = require('path');
const extend = require('deep-extend');

const SystemError = require('../errors/system-error');
const objHelper = require('../helpers/object');
const config = require('../services/config');

module.exports = {
    '_getFileName': () => {
        const sd = config.get('storageDestination');
        const sf = config.get('storageFile');

        return path.join(sd, `${sf}.json`);
    },
    '_fileExists': function _fileExists () {
        return fs.existsSync(this._getFileName());
    },
    '_createFile': function _createFile () {
        // Create the file
        fs.writeFileSync(this._getFileName(), '{}');
    },
    'getAll': function getAll () {
        if (!this._fileExists()) {
            this._createFile();
        }

        const output = fs.readFileSync(this._getFileName(), 'utf8');

        const parsedOutput = JSON.parse(output);

        return parsedOutput;
    },
    'get': function get (key) {
        // Store the type of all the properties
        const tk = typeof key;

        // Validate the key
        if (tk !== 'string') {
            throw new SystemError(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        // Use the getAll method to return the specific key
        const po = this.getAll();

        return objHelper.access(po, key);
    },

    // Only supports 1 dimentional object
    'set': function set (key, value) {
        // Initialize a new object
        let newObject = {};

        // Store the type of all the properties
        const tk = typeof key;
        const tv = typeof value;

        // Validate the ip address
        if (tk !== 'string') {
            throw new SystemError(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        // Validate the value
        if (tk === 'function') {
            throw new SystemError(`value cannot be a function.\nValue: ${value}\nType: ${tv}`);
        }

        // Create new object
        newObject[key] = value;

        const po = this.getAll();

        // Merge both object
        newObject = extend(po, newObject);

        fs.writeFileSync(this._getFileName(), JSON.stringify(newObject), 'utf8');
    }
};
