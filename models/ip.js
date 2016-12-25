const rest = require('restler');

const config = require('../services/config');
const logger = require('../services/logger');
const SystemError = require('../errors/system-error');

module.exports = {
    get: (callback) => {
        let tc = typeof callback;

        if (tc !== 'function') {
            throw new SystemError(`Type: ${tc} of callback is not valid`);
        }

        let request = rest.get(config.get('ipEndpoint'), {
            timeout: 10000
        });

        request.on('timeout', function(ms){
            throw new SystemError(`Timeout while getting the ip address after ${ms}ms`);
        });

        request.on('complete', function(data, response) {
            let sc = response.statusCode;
            let td = typeof data;

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
}
