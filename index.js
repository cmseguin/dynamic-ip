// const argv = require('minimist')(process.argv.slice(2));
const Ip = require('./models/ip');
const Records = require('./models/records');
const Storage = require('./models/storage');
const config = require('./services/config');
const logger = require('./services/logger');

// Here we store the ip address in memory
let cachedIp = null;

const domains = config.get('domains');

setInterval(() => {
    // If the ip that is stored in the file is the same as what we have
    // we store it in the cachedIp. We really only read from the file
    // once per process.
    if (typeof cachedIp !== 'string') {
        const fIp = Storage.get('ip');

        // If there was indeed a Ipaddress in the file, we store it in
        // memory to not have to read it again from memory
        if (typeof fIp === 'string') {
            cachedIp = fIp;
        }
    }

    try {
        // Request our own ip address from a 3rd party free service
        Ip.get((ip) => {

            // Check if the ip is the same, in which case we stop any other
            // actions.
            if (cachedIp === ip) {
                logger.debug(`Ip did not change`);

                return;
            }

            // If the ip that we request from the ip detector endpoint is
            // different than the address we previously had, then:

            // Set the new ip address in the memory
            cachedIp = ip;

            // Set the new ip in the file storage as well
            Storage.set('ip', ip);


            // Loop through all the domains that needs to be updated
            for (let i = 0; i < domains.length; i++) {
                const domainStack = domains[i];
                const domain = domainStack.domain;
                const records = domainStack.records;


                // Now we get the records from digitalocean
                Records.get(domain, (recs) => {

                    // We will now loop through the records returned from
                    // digitalocean
                    for (let x = 0; x < recs.length; x++) {
                        const rec = recs[x];

                        // Skip records that are not A cause they are not relevant
                        if (rec.type !== 'A') {
                            continue;
                        }

                        // If no record was found in the config skip
                        if (records.indexOf(rec.name) === -1) {
                            continue;
                        }

                        // If we find the record, update it
                        Records.set(domain, rec.id, ip, () => {
                            logger.info(`Record: ${rec.name} for domain: ${domain} updated with ip: ${ip}`);
                        });
                    }
                });
            }
        });
    } catch (e) {
        logger.error(e.getMessage());
    }
}, config.get('interval'));
