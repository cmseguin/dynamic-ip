const rest = require('restler');
const url = require('url');

const Error = require('../errors/Error');
const config = require('../services/config');

const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
const domainregex = /^((?=[a-z0-9-]{1,63}\.)[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/;

const doe = config.get('digitalOceanEndpoint');
const dot = config.get('digitalOceanToken');

module.exports = {
    /**
     * Build the url for the get request.
     * --
     * @param {string} domain The domain for the url
     * @returns {object} Promise
     */
    '_buildGetEndpoint': (domain) => {
        // Store the type of the arguments
        const td = typeof domain;

        // Validate the domain
        if (td !== 'string' || !domain.match(domainregex)) {
            throw new Error(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`);
        }

        return url.resolve(doe, `domains/${domain}/records`);
    },

    /**
     * Build the url for the set request.
     * --
     * @param {string} domain The domain for the url
     * @param {string} record The record id for the url.
     * @returns {object} Promise
     */
    '_buildSetEndpoint': (domain, record) => {
        // Store the type of the arguments
        const td = typeof domain;
        const tr = typeof record;

        // Validate the domain
        if (td !== 'string' || !domain.match(domainregex)) {
            throw new Error(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`);
        }

        // Validate the record
        if (td !== 'string') {
            throw new Error(`Record is not a valid.\nValue: ${record}\nType: ${tr}`);
        }

        return url.resolve(doe, `domains/${domain}/records/${record}`);
    },

    /**
     * Make a request to a digitalocean to get the dns records of a certain
     * requested domain.
     * This is an async function.
     * --
     * @param {string} domain The domain you wish to get the record of.
     * @returns {object} Promise
     */
    'get': function get (domain) {
        const promise = new Promise((resolve, reject) => {
            let endpoint = null;

            // Storing the endpoint
            try {
                endpoint = this._buildGetEndpoint(domain);
            } catch (e) {
                reject(e);

                return; // Go no further;
            }

            // Store the type of the arguments
            const td = typeof domain;

            // Validate the domain
            if (td !== 'string' || !domain.match(domainregex)) {
                reject(new Error(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`));

                return; // Go no further;
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
                reject(Error(`Timeout while getting the records after ${ms}ms`));
            });

            // Subscribe to the complete event
            request.on('complete', (data, response) => {
                // Store the status code
                const sc = response.statusCode;

                // Ensure that the status code range in the 200
                if (sc < 200 || sc >= 300) {
                    reject(new Error(`Failed to get records with status code: ${sc}`));

                    return; // Go no further;
                }

                // Make sure the api is returning the correct format.
                if (
                    typeof data !== 'object' ||
                    typeof data.domain_records !== 'object' ||
                    !(data.domain_records instanceof Array)
                ) {
                    reject(new Error(`The data returned if not a valid format`));

                    return; // Go no further;
                }

                // resolve promise
                resolve(data.domain_records, response);
            });
        });

        return promise;
    },

    /**
     * Make a request to a digitalocean to set the dns records of a certain
     * requested domain with an ip value.
     * This is an async function.
     * --
     * @param {string} domain The domain you wish to set the record of.
     * @param {string} record The id of the record you wish to update.
     * @param {string} ip The ip you wish to update the record with.
     * @returns {object} Promise
     */
    'set': function set (domain, record, ip) {
        const promise = new Promise((resolve, reject) => {
            let endpoint = null;

            // Storing the endpoint
            try {
                endpoint = this._buildSetEndpoint(domain, record);
            } catch (e) {
                reject(e);

                return; // Go no further;
            }

            // Store the type of the arguments
            const td = typeof domain;
            const tr = typeof record;
            const ti = typeof ip;

            // Validate the record
            if (tr !== 'number') {
                reject(new Error(`Record id is not a valid.\nValue: ${record}\nType: ${tr}`));

                return; // Go no further;
            }

            // Validate the domain
            if (td !== 'string' || !domain.match(domainregex)) {
                reject(new Error(`Domain is not a valid.\nValue: ${domain}\nType: ${td}`));

                return; // Go no further;
            }

            // Validate the ip address
            if (ti !== 'string' || !ip.match(ipregex)) {
                reject(new Error(`Ip address is not a valid.\nValue: ${ip}\nType: ${ti}`));

                return; // Go no further;
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
                reject(new Error(`Timeout while setting the records after ${ms}ms`));
            });

            // Subscribe to the complete event
            request.on('complete', (data, response) => {
                // Store the status code
                const sc = response.statusCode;

                // Ensure that the status code range in the 200
                if (sc < 200 || sc >= 300) {
                    reject(new Error(`Failed to get records with status code: ${sc}`));

                    return; // Go no further;
                }

                // Resolve promise
                resolve(data, response);
            });
        }); // end of promise

        return promise;
    }
};
