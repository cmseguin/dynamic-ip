const rest = require('restler');

const config = require('../services/config');
const SystemError = require('../errors/system-error');

module.exports = {
    'get': (callback) => {
        const tc = typeof callback;

        if (tc !== 'function') {
            throw new SystemError(`Type: ${tc} of callback is not valid`);
        }

        const request = rest.get(config.get('ipEndpoint'), {
            'timeout': 10000
        });

        request.on('timeout', (ms) => {
            throw new SystemError(`Timeout while getting the ip address after ${ms}ms`);
        });

        request.on('complete', (data, response) => {
            const sc = response.statusCode;
            const td = typeof data;

            if (sc < 200 || sc >= 300) {
                throw new SystemError(`Failed to get the ip with status code: ${sc}`);
            }

            if (td !== 'object') {
                throw new SystemError(`Type: ${td} of data is not an object`);
            }

            if (!data.ip) {
                throw new SystemError(`No Ip address was returned`);
            }

            callback(data.ip, response);
        });
    }
};
