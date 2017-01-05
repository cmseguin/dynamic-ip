const rest = require('restler');
const url = require('url');

const config = require('../services/config');
const SystemError = require('../errors/system-error');

const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
const domainregex = /^((?=[a-z0-9-]{1,63}\.)[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/;

const doe = config.get('digitalOceanEndpoint');
const dot = config.get('digitalOceanToken');

module.exports = {
    '_getGetEndpoint': (domain) => {
        const td = typeof domain;

        // Validate the domain
        if (td !== 'string' || !domain.match(domainregex)) {
            throw new SystemError(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`);
        }

        return url.resolve(doe, `domains/${domain}/records`);
    },
    '_getSetEndpoint': (domain, record) => {
        const td = typeof domain;
        const tr = typeof record;

        // Validate the domain
        if (td !== 'string' || !domain.match(domainregex)) {
            throw new SystemError(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`);
        }

        // Validate the record
        if (td !== 'string') {
            throw new SystemError(`Record is not a valid.\nValue: ${record}\nType: ${tr}`);
        }

        return url.resolve(doe, `domains/${domain}/records/${record}`);
    },
    'get': function get (domain, callback) {

        // Storing the endpoint
        const endpoint = this._getGetEndpoint(domain);

        // Store the type of all the properties
        const tc = typeof callback;
        const td = typeof domain;

        // Validate the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        // Validate the domain
        if (td !== 'string' || !domain.match(domainregex)) {
            throw new SystemError(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`);
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
            // Store the status code
            const sc = response.statusCode;

            // Ensure that the status code range in the 200
            if (sc < 200 || sc >= 300) {
                throw new SystemError(`Failed to get records with status code: ${sc}`);
            }

            // Make sure the api is returning the correct format.
            if (
                typeof data !== 'object' ||
                typeof data.domain_records !== 'object' ||
                !(data.domain_records instanceof Array)
            ) {
                throw new SystemError(`The data returned if not a valid format`);
            }

            // Callback
            callback(data.domain_records, response);
        });
    },
    'set': function set (domain, record, ip, callback) {

        // Set the endpoint url
        const endpoint = this._getSetEndpoint(domain, record);

        // Store the type of all the properties
        const tc = typeof callback;
        const td = typeof domain;
        const tr = typeof record;
        const ti = typeof ip;

        // Validating the callback
        if (tc !== 'function') {
            throw new SystemError(`Callback is not valid.\nType: ${tc}`);
        }

        // Validate the ip address
        if (ti !== 'string' || !ip.match(ipregex)) {
            throw new SystemError(`Ip address is not a valid.\nValue: ${ip}\nType: ${ti}`);
        }

        // Validate the record
        if (tr !== 'number') {
            throw new SystemError(`Record id is not a valid.\nValue: ${record}\nType: ${tr}`);
        }

        // Validate the domain
        if (td !== 'string' || !domain.match(domainregex)) {
            throw new SystemError(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`);
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

        // Subscribe to the timeout event
        request.on('timeout', (ms) => {
            throw new SystemError(`Timeout while setting the records after ${ms}ms`);
        });

        // Subscribe to the complete event
        request.on('complete', (data, response) => {
            // Store the status code
            const sc = response.statusCode;

            // Ensure that the status code range in the 200
            if (sc < 200 || sc >= 300) {
                throw new SystemError(`Failed to get records with status code: ${sc}`);
            }

            // Callback
            callback(data, response);
        });
    }
};
