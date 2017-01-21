// const argv = require('minimist')(process.argv.slice(2));
const Ip = require('./models/ip');
const Records = require('./models/records');
const Storage = require('./models/storage');
const config = require('./services/config');
const logger = require('./services/logger');

const Debug = require('./errors/Debug');
const exceptionHandler = require('./errors/handler');

const engine = {
    'updateNecessityCheck': function updateNecessityCheck ({ip}) {
        // Check if the ip is the same, in which case we stop any other
        // actions.
        if (engine.ip === ip) {
            throw new Debug(`Ip did not change`);
        }

        return ip;
    },
    'setRecords': function setRecords (domain, records, response) {
        const promises = [];

        // We will now loop through the records returned from
        // digitalocean
        for (let x = 0; x < response.length; x++) {
            const rec = response[x];

            // Skip records that are not A cause they are not relevant
            if (rec.type !== 'A') {
                continue;
            }

            // If no record was found in the config skip
            if (records.indexOf(rec.name) === -1) {
                continue;
            }

            // Set the record (async)
            const promise = Records.set(domain, rec.id, engine.ip);

            // If we find the record, update it
            promise.then(() => {
                logger.info(`Record: "${rec.name}" for domain: "${domain}" updated with ip: "${engine.ip}"`);
            }).catch(exceptionHandler);

            // Push the promise in the stack
            promises.push(promise);
        }

        // When we set all of the records
        return Promise.all(promises);
    },
    'updateRecords': function updateRecords () {
        const promises = [];

        // Loop through all the domains that needs to be updated
        for (let i = 0; i < engine.domains.length; i++) {
            const domainStack = engine.domains[i];
            const domain = domainStack.domain;
            const records = domainStack.records;

            // Now we get the records from digitalocean
            Records.get(domain).then(({response}) => {
                promises.push(engine.setRecords(domain, records, response));
            })
            .catch(exceptionHandler);
        }

        // When we set all of the records
        return Promise.all(promises);
    },
    'getStoredIp': function getStoredIp () {
        let sIp = null;

        try {
            sIp = Storage.getSync('ip');
        } catch (e) {
            exceptionHandler(e);
        }

        // If there was indeed a Ipaddress in the file, we store it in
        // memory to not have to read it again from memory
        if (typeof sIp === 'string') {
            return sIp;
        }
    },
    'setStoredIp': function setStoredIp (ip) {
        // Set the new ip in the file storage as well
        try {
            Storage.setSync('ip', ip);
        } catch (e) {
            exceptionHandler(e);
        }

        // If the ip that we request from the ip detector endpoint is
        // different than the address we previously had, then set the new ip address
        // in the memory
        engine.ip = ip;
    },
    'start': function start () {
        // If the ip that is stored in the file is the same as what we have
        // we store it in the cachedIp. We really only read from the file
        // once per process.
        if (!engine.ip) {
            engine.ip = engine.getStoredIp();
        }

        if (!engine.domains) {
            engine.domains = config.get('domains');
        }

        if (!engine.interval) {
            engine.interval = config.get('interval');
        }

        Ip.get()
            .then(engine.updateNecessityCheck)
            .then(engine.setStoredIp)
            .then(engine.updateRecords)
            .catch(exceptionHandler) // We make sure to catch here to always restart
            .then(engine.restart)
            .catch(exceptionHandler);
    },
    'restart': function restart () {
        setTimeout(engine.start, engine.interval);
    }
};

engine.start();
