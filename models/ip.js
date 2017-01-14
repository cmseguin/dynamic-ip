const rest = require('restler');

const Error = require('../errors/Error');
const config = require('../services/config');

module.exports = {
    /**
     * Make a request to a third-party service to get our ip address.
     * This is an async function.
     * --
     * @returns {object} Promise
     */
    'get': () => {
        const promise = new Promise((resolve, reject) => {
            // Initialize the request
            const request = rest.get(config.get('ipEndpoint'), {
                'timeout': 10000
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

                    return; // Go no further;
                }

                // Validate the body of the response
                if (td !== 'object') {
                    reject(new Error(`Type: ${td} of data is not an object`));

                    return; // Go no further;
                }

                // Validate that an ip was returned
                if (!data.ip) {
                    reject(new Error(`No Ip address was returned`));

                    return; // Go no further;
                }

                // Resolve the promise
                resolve(data.ip);
            });
        });

        return promise;
    }
};
