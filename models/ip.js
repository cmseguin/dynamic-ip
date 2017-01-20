const rest = require('restler');
const url = require('url');

const Error = require('../errors/Error');
const config = require('../services/config');

module.exports = {
    /**
     * Allow us to adjust the timeout if needed, very useful for testing since
     * we can mock a timeout without waiting seconds
     */
    '_requestTimeout': 10000,

    /**
     * Returns the get endpoint, makes it easier to tests afterwards
     */
    '_endpoint': config.get('ipEndpoint'),

    /**
     * Returns the get path, makes it easier to tests afterwards
     */
    '_getPath': '/',

    /**
     * Make a request to a third-party service to get our ip address.
     * This is an async function.
     * --
     * @returns {object} Promise
     */
    'get': function get () {
        const promise = new Promise((resolve, reject) => {
            // Initialize the request
            const request = rest.get(url.resolve(this._endpoint, this._getPath), {
                'query': { 'format': 'json' },
                'timeout': this._requestTimeout
            });

            // Subscribe to the timeout event
            request.on('timeout', (ms) => {
                reject(new Error(`Timeout while getting the ip address after ${ms}ms`));
            });

            // Subscribe to the complete event
            request.on('complete', (data, response) => {
                // Store the status code
                const sc = response.statusCode;

                // Store the type of all the properties
                const td = typeof data;

                // Ensure that the status code range in the 200
                if (sc < 200 || sc >= 300) {
                    reject(new Error(`Failed to get the ip with status code: ${sc}`));
                }

                // Validate the body of the response
                if (td !== 'object') {
                    reject(new Error(`Type: ${td} of data is not an object`));
                }

                // Validate that an ip was returned
                if (!data.ip) {
                    reject(new Error(`No Ip address was returned`));
                }

                // Resolve the promise
                resolve({
                    'ip': data.ip,
                    data,
                    response
                });
            });
        });

        return promise;
    }
};
