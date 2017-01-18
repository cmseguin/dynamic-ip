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
        const promise = new Promise((resolve) => {
            // Initialize the request
            const request = rest.get(config.get('ipEndpoint'), {
                'timeout': 10000
            });

            // Subscribe to the timeout event
            request.on('timeout', (ms) => {
                throw new Error(`Timeout while getting the ip address after ${ms}ms`);
            });

            // Subscribe to the complete event
            request.on('complete', (data, response) => {
                // Store the status code
                const sc = response.statusCode;

                // Store the type of all the properties
                const td = typeof data;

                // Ensure that the status code range in the 200
                if (sc < 200 || sc >= 300) {
                    throw new Error(`Failed to get the ip with status code: ${sc}`);
                }

                // Validate the body of the response
                if (td !== 'object') {
                    throw new Error(`Type: ${td} of data is not an object`);
                }

                // Validate that an ip was returned
                if (!data.ip) {
                    throw new Error(`No Ip address was returned`);
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
