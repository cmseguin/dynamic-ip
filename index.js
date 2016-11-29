const argv = require('minimist')(process.argv.slice(2));
const rest = require('restler');
const dateFormat = require('dateformat');
const config = require('./config');

const ipEndpoint = 'https://api.ipify.org?format=json';
const doEndpoint = 'https://api.digitalocean.com/v2/';

var cachedIp = null;

const getConsolePrefix = function () {
    let now = new Date();
    return `[${dateFormat(now, "yyyy-mm-dd HH:MM:ss")}]`
};

const getIp = function (callback) {
    rest.get(ipEndpoint, {
        timeout: 10000
    }).on('timeout', function(ms){
        console.log(`${getConsolePrefix()} getIp timeout after ${ms}ms`);
    }).on('complete',function(data, response){
        if (response.statusCode >= 200 && response.statusCode < 300) {
            if (data && data.ip) {
                callback(data.ip);
            }
        } else {
            console.log(`${getConsolePrefix()} getIp failed with status code: ${response.statusCode}`);
        }
    });
};

const getRecords = function (callback) {
    rest.get(`${doEndpoint}domains/${config.domain}/records`, {
        timeout: 10000,
        headers: {
            'Accept': '*/*',
            'User-Agent': 'Restler for node.js',
            'Authorization' : `Bearer ${config.doToken}`
        }
    }).on('timeout', function(ms){
        console.log(`${getConsolePrefix()} getRecords timeout after ${ms}ms`);
    }).on('complete',function(data, response){
        if (response.statusCode >= 200 && response.statusCode < 300) {
            if (data.domain_records) {
                for (let i in data.domain_records) {
                    if (data.domain_records[i].name === config.record) {
                        callback(data.domain_records[i]);
                        break;
                    }
                }
            }
        } else {
            console.log(`${getConsolePrefix()} getRecords failed with status code: ${response.statusCode}`);
        }
    });
};

const setRecords = function (id, ip, callback) {
    rest.put(`${doEndpoint}domains/${config.domain}/records/${id}`, {
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
    }).on('timeout', function(ms){
        console.log(`${getConsolePrefix()} setRecords timeout after ${ms}ms`);
    }).on('complete',function(data, response){
        if (response.statusCode >= 200 && response.statusCode < 300) {
            callback();
        } else {
            console.log(`${getConsolePrefix()} setRecords failed with status code: ${response.statusCode}`);
        }
    });
};

setInterval(() => {
    getIp((ip) => {
        if (!cachedIp || cachedIp !== ip) {
            cachedIp = ip;
            getRecords((record) => {
                setRecords(record.id, ip, () => {
                    console.log(`${getConsolePrefix()} Records updated`);
                });
            });
        } else {
            console.log(`${getConsolePrefix()} Ip did not change`)
        }
    });
}, config.interval);
