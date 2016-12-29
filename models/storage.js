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

        return path.join(sd, sf);
    },
    '_fileExists': function _fileExists () {
        return fs.existsSync(this._getFileName());
    },
    '_createFile': function _createFile (callback) {
        // Store the type of all the properties
        const tc = typeof callback;

        // Validating the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        // Create the file
        fs.writeFile(this._getFileName(), '{}', (error) => {
            if (error) {
                throw new SystemError(error);
            }

            callback();
        });
    },
    'getAll': function getAll (callback) {
        // Store the type of all the properties
        const tc = typeof callback;

        // Validating the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        if (!this._fileExists()) {
            this._createFile();
        }

        fs.readFile(this._getFileName(), 'utf8', (error, output) => {
            if (error) {
                throw new SystemError(error);
            }

            const parsedOutput = JSON.parse(output);

            callback(parsedOutput);
        });
    },
    'get': function get (key, callback) {
        // Store the type of all the properties
        const tk = typeof key;
        const tc = typeof callback;

        // Validate the key
        if (tk !== 'string') {
            throw new SystemError(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        // Validating the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        // Use the getAll method to return the specific key
        this.getAll((po) => {
            callback(objHelper.access(po, key));
        });
    },

    // Only supports 1 dimentional object
    'set': function set (key, value, callback) {
        // Initialize a new object
        let newObject = {};

        // Store the type of all the properties
        const tk = typeof key;
        const tv = typeof value;
        const tc = typeof callback;

        // Validate the ip address
        if (tk !== 'string') {
            throw new SystemError(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        // Validate the value
        if (tk === 'function') {
            throw new SystemError(`value cannot be a function.\nValue: ${value}\nType: ${tv}`);
        }

        // Validating the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        // Create new object
        newObject[key] = value;

        this.getAll((po) => {
            // Merge both object
            newObject = extend(po, newObject);

            fs.writeFile(this._getFileName(), JSON.stringify(newObject), 'utf8', (error) => {
                if (error) {
                    throw new SystemError(error);
                }

                callback();
            });
        });
    }
};
