const rest = require('restler');

const config = require('../services/config');
const SystemError = require('../errors/system-error');

const domainregex = /^((?=[a-z0-9-]{1,63}\.)[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/;

const doe = config.get('digitalOceanEndpoint');
const dot = config.get('digitalOceanToken');

module.exports = {
    'get': (domain, callback) => {
        // Storing the endpoint
        const endpoint = `${doe}domains/${domain}/records`;

        // Store the type of all the properties
        const tc = typeof callback;
        const td = typeof domain;

        // Validating the properties
        if (tc !== 'function') {
            throw new SystemError(`Type: ${tc} of callback is not valid`);
        }

        if (td !== 'string') {
            throw new SystemError(`Type: ${td} of domain is not valid`);
        }

        if (!domain.match(domainregex)) {
            throw new SystemError(`${domain} is not a valid domain`);
        }

        // Initialize the request
        const request = rest.get(endpoint, {
            'timeout': 10000,
            'headers': {
                'Accept': '*/*',
                'User-Agent': 'Restler for node.js',
                'Authorization': `Bearer ${dot}`
            }
        });

        // Subscribe to the timeout event
        request.on('timeout', (ms) => {
            throw new SystemError(`Timeout while getting the records after ${ms}ms`);
        });

        // Subscribe to the complete event
        request.on('complete', (data, response) => {
            const sc = response.statusCode;

            if (sc < 200 || sc >= 300) {
                throw new SystemError(`Failed to get records with status code: ${sc}`);
            }

            if (
                typeof data !== 'object' ||
                typeof data.domain_records !== 'object' ||
                !(data.domain_records instanceof Array)
            ) {
                throw new SystemError(`The data returned if not a valid format`);
            }

            callback(data.domain_records, response);
        });
    },
    'set': (domain, record, ip, callback) => {

        // Set the endpoint url
        const endpoint = `${doe}domains/${domain}/records/${record}`;

        // Store the type of all the properties
        const tc = typeof callback;

        // Validating the properties
        if (tc !== 'function') {
            throw new SystemError(`Type: ${tc} of callback is not valid`);
        }

        // Initialize the request
        const request = rest.put(endpoint, {
            'timeout': 10000,
            'data': JSON.stringify({
                'data': ip
            }),
            'headers': {
                'Accept': '*/*',
                'User-Agent': 'Restler for node.js',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${dot}`
            }
        });

        request.on('timeout', (ms) => {
            throw new SystemError(`Timeout while setting the records after ${ms}ms`);
        });

        request.on('complete', (data, response) => {
            const sc = response.statusCode;

            if (sc < 200 || sc >= 300) {
                throw new SystemError(`Failed to get records with status code: ${sc}`);
            }

            callback();
        });
    }

};
