const rest = require('restler');
const logger = require('../services/logger');
const config = require('../services/config');

module.exports = {
    get: (callback) => {
        let endpoint = `${config.get('digitalOceanEndpoint')}domains/${config.domain}/records`;
        let request = rest.get(endpoint, {
            timeout: 10000,
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Restler for node.js',
                'Authorization' : `Bearer ${config.doToken}`
            }
        });

        request.on('timeout', function(ms) {
            logger.log(`Timeout while getting the records after ${ms}ms`);
        });

        request.on('complete',function(data, response) {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                logger.log(`Failed to get records with status code: ${response.statusCode}`);
                return;
            }

            if (data.domain_records) {
                for (let i in data.domain_records) {
                    if (
                        data.domain_records[i].name === config.record &&
                        typeof callback === 'function'
                    ) {
                        callback(data.domain_records[i]);
                        break;
                    }
                }
            }
        });
    },
    set: (domain, record, ip, callback) => {
        let endpoint = `${config.get('digitalOceanEndpoint')}domains/${domain}/records/${record}`;
        let request = rest.put(endpoint, {
            timeout: 10000,
            data: JSON.stringify({
                'data': ip
            }),
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Restler for node.js',
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${config.doToken}`
            }
        })

        request.on('timeout', function(ms) {
            logger.log(`Timeout while setting the records after ${ms}ms`);
        })

        request.on('complete',function(data, response) {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                logger.log(`Failed to get records with status code: ${response.statusCode}`);
                return;
            }

            if (typeof callback === 'function') {
                callback();
            }
        });
    }
}
