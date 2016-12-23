const argv = require('minimist')(process.argv.slice(2));
const Ip = require('models/ip');
const Records = require('models/records');

var cachedIp = null;

setInterval(() => {
    Ip.get((ip) => {
        if (!cachedIp || cachedIp !== ip) {
            cachedIp = ip;
            Records.get((record) => {
                Records.set(record.id, ip, () => {
                    logger.log(`Records updated!`);
                });
            });
        } else {
            logger.log(`Ip did not change`)
        }
    });
}, config.interval);
