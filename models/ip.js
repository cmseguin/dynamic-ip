const rest = require('restler');

const config = require('../services/config');
const SystemError = require('../errors/system-error');

module.exports = {
    'get': (callback) => {
        // Store the type of all the properties
        const tc = typeof callback;

        // Validating the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        // Initialize the request
        const request = rest.get(config.get('ipEndpoint'), {
            'timeout': 10000
        });

        // Subscribe to the timeout event
        request.on('timeout', (ms) => {
            throw new SystemError(`Timeout while getting the ip address after ${ms}ms`);
        });

        // Subscribe to the complete event
        request.on('complete', (data, response) => {
            // Store the status code
            const sc = response.statusCode;

            // Store the type of all the properties
            const td = typeof data;

            // Ensure that the status code range in the 200
            if (sc < 200 || sc >= 300) {
                throw new SystemError(`Failed to get the ip with status code: ${sc}`);
            }

            // Validate the body of the response
            if (td !== 'object') {
                throw new SystemError(`Type: ${td} of data is not an object`);
            }

            // Validate that an ip was returned
            if (!data.ip) {
                throw new SystemError(`No Ip address was returned`);
            }

            // Callback
            callback(data.ip, response);
        });
    }
};
