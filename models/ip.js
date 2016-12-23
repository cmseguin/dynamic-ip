const rest = require('restler');
const logger = require('../services/logger');
const config = require('../services/config');

module.exports = {
    get: (callback) => {
        let request = rest.get(config.get('ipEndpoint'), {
            timeout: 10000
        });

        request.on('timeout', function(ms){
            logger.log(`Timeout while getting the ip address after ${ms}ms`);
        });

        request.on('complete',function(data, response){
            if (response.statusCode >= 200 && response.statusCode < 300) {
                if (typeof callback === 'function' && data && data.ip) {
                    callback(data.ip, response);
                }
            } else {
                logger.log(`Failed to get the ip with status code: ${response.statusCode}`);
            }
        });
    }
}
