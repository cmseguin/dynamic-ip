const rest = require('restler');
const logger = require('../services/logger');
const config = require('../services/config');

module.exports = {
    get: (domain, record, callback) => {
        let endpoint = `${config.get('digitalOceanEndpoint')}domains/${domain}/records`;

        let request = rest.get(endpoint, {
            timeout: 10000,
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Restler for node.js',
                'Authorization' : `Bearer ${config.get('digitalOceanToken')}`
            }
        });

        request.on('timeout', function(ms) {
            throw new InternalError(`Timeout while getting the records after ${ms}ms`);
        });

        request.on('complete',function(data, response) {
            let sc = response.statusCode;

            if (sc < 200 || sc >= 300) {
                throw new InternalError(`Failed to get records with status code: ${sc}`);
            }

            if (
                typeof data !== 'object'
                typeof data.domain_records !== 'object' ||
                !(data.domain_records instanceof Array)
            ) {
                throw new InternalError(`The data returned if not a valid format`);
            }

            for (let i in data.domain_records) {
                if (
                    data.domain_records[i].name === record &&
                    typeof callback === 'function'
                ) {
                    callback(data.domain_records[i], response);
                    break;
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
            throw new InternalError(`Timeout while setting the records after ${ms}ms`);
        })

        request.on('complete',function(data, response) {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                throw new InternalError(`Failed to get records with status code: ${response.statusCode}`);
                return;
            }

            if (typeof callback === 'function') {
                callback();
            }
        });
    }
}
