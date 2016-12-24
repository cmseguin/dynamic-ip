const rest = require('restler');
const logger = require('../services/logger');
const config = require('../services/config');

module.exports = {
    get: (callback) => {
        let tc = typeof callback;

        if (tc !== 'function') {
            throw new TypeError(`Type: ${tc} of callback is not valid`);
        }

        let request = rest.get(config.get('ipEndpoint'), {
            timeout: 10000
        });

        request.on('timeout', function(ms){
            throw new InternalError(`Timeout while getting the ip address after ${ms}ms`);
        });

        request.on('complete', function(data, response) {
            let sc = response.statusCode;
            let td = typeof data;

            if (sc < 200 || sc >= 300) {
                throw new InternalError(`Failed to get the ip with status code: ${sc}`);
            }

            if (td !== 'object') {
                throw new InternalError(`Type: ${td} of data is not an object`);
            }

            if (!data.ip) {
                throw new InternalError(`No Ip address was returned`);
            }

            callback(data.ip, response);
        });
    }
}
