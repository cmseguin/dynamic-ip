const fs = require('fs');
const path = require('path');
const extend = require('deep-extend');

const Error = require('../errors/Error');
const objHelper = require('../helpers/object');
const config = require('../services/config');


module.exports = {
    /**
     * Get the filename of the storage file.
     * --
     * @returns {string} filename
     */
    '_getFileName': () => {
        const sd = config.get('storageDestination');
        const sf = config.get('storageFile');

        return path.join(sd, `${sf}.json`);
    },

    /**
     * Check if the storage file exists or not.
     * --
     * @return {boolean} file existance
     */
    '_fileExistsSync': function _fileExistsSync () {
        return fs.existsSync(this._getFileName());
    },

    /**
     * Create a storage file with an empty json object inside.
     * --
     * @returns {void}
     */
    '_createFile': function _createFile () {
        // Create the file
        fs.writeFileSync(this._getFileName(), '{}');
    },

    /**
     * Get the whole storage syncronisly
     * --
     * @returns {object} storage
     */
    'getWholeStorageSync': function getWholeStorageSync () {
        if (!this._fileExistsSync()) {
            this._createFile();
        }

        const output = fs.readFileSync(this._getFileName(), 'utf8');

        const parsedOutput = JSON.parse(output);

        return parsedOutput;
    },

    /**
     * Get a specific key/value from the storage.
     * Only supports 1 dimentional object.
     * --
     * @param {string} key The key to get the value from
     * @returns {mixed} value
     */
    'getSync': function getSync (key) {
        // Store the type of all the properties
        const tk = typeof key;

        // Validate the key
        if (tk !== 'string') {
            throw new Error(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        // Use the getWholeStorageSync method to return the specific key
        const po = this.getWholeStorageSync();

        return objHelper.access(po, key);
    },

    /**
     * Get a specific key/value from the storage.
     * Only supports 1 dimentional object.
     * --
     * @param {string} key The key to get the value from
     * @param {string|number|bool|object} value The key to get the value from
     * @returns {mixed} value
     */
    'setSync': function setSync (key, value) {
        // Initialize a new object
        let newObject = {};

        // Store the type of all the properties
        const tk = typeof key;
        const tv = typeof value;

        // Validate the key
        if (tk !== 'string') {
            throw new Error(`Key is not a valid.\nValue: ${key}\nType: ${tk}`);
        }

        // Validate the value
        if (tv === 'function') {
            throw new Error(`value cannot be a function.\nValue: ${value}\nType: ${tv}`);
        }

        // Create new object
        newObject[key] = value;

        const po = this.getWholeStorageSync();

        // Merge both object
        newObject = extend(po, newObject);

        fs.writeFileSync(this._getFileName(), JSON.stringify(newObject), 'utf8');
    }
};
