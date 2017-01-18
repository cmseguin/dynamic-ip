const chai = require('chai');

const Ip = require('../models/ip');
const Records = require('../models/records');
const Error = require('../errors/Error');
const FatalError = require('../errors/FatalError');
const Notice = require('../errors/Notice');
const Warning = require('../errors/Warning');
const config = require('../services/config');

const should = chai.should();

const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;

describe('Testing the ip address API', () => {
    let ipAddress = null;
    let response = null;

    before((done) => {
        Ip.get().then((result) => {
            ipAddress = result.ip;
            response = result.response;
            done();
        });
    });

    it('Should return a response of 200', () => {
        response.statusCode.should.equal(200);
    });

    it('Ip address should have a valid ipv4 format', () => {
        ipAddress.should.match(ipregex);
    });
});

describe('Testing DigitalOcean API to get records', () => {
    let records = null;
    let response = null;

    before((done) => {
        Records.get('charlesmathieuseguin.com').then((result) => {
            records = result.records;
            response = result.response;
            done();
        });
    });

    it('Should return a response of 200', () => {
        response.statusCode.should.be.equal(200);
    });

    it('Should return an array', () => {
        records.should.be.an('array');
    });

    it('Sending an int for domain should throw a system error', () => {
        Records.get(1, 'home').catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });

    it('Sending an array for domain should throw a system error', () => {
        Records.get(['charlesmathieuseguin.com']).catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });

    it('Sending a non-valid domain should throw a system error', () => {
        Records.get('charlesmathieuseguin').catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });
});

describe('Testing DigitalOcean API to set records', () => {
    it('Sending a non-valid domain should throw a system error', () => {
        Records.set('charlesmathieuseguin', 'test', '0.0.0.0').catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });

    it('Sending a non-valid record should throw a system error', () => {
        Records.set('charlesmathieuseguin.com', 'test', '0.0.0.0').catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });

    it('Sending a non-valid ip should throw a system error', () => {
        Records.set('charlesmathieuseguin.com', 1, '0.0.0').catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });

    it('Sending a valid ip but non valid records should throw an error', () => {
        Records.set('charlesmathieuseguin.com', 1, '137.175.144.52').catch((e) => {
            e.should.be.an.instanceof(Error);
        });
    });
});

describe('Testing the storage model', () => {
    it('Should create a file if none exists', () => {

    });
});
