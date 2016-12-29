const chai = require('chai');

const Ip = require('../models/ip');
const Records = require('../models/records');
const SystemError = require('../errors/system-error');
const config = require('../services/config');

const should = chai.should();

const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;

describe('Testing the ip address API', () => {
    let ipAddress = null;
    let response = null;

    before((done) => {
        Ip.get((ip, res) => {
            ipAddress = ip;
            response = res;
            done();
        });
    });

    it('Should return a response of 200', () => {
        response.statusCode.should.be.equal(200);
    });

    it('Ip address should have a valid ipv4 format', () => {
        ipAddress.should.match(ipregex);
    });
});

describe('Testing DigitalOcean API to get records', () => {
    let records = null;
    let response = null;

    before((done) => {
        Records.get('charlesmathieuseguin.com', (rec, res) => {
            records = rec;
            response = res;
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
        (() => {
            Records.get(1, 'home', () => {});
        }).should.throw(SystemError);
    });

    it('Sending an array for domain should throw a system error', () => {
        (() => {
            Records.get(['charlesmathieuseguin.com'], () => {});
        }).should.throw(SystemError);
    });

    it('Sending a non-valid domain should throw a system error', () => {
        (() => {
            Records.get('charlesmathieuseguin', () => {});
        }).should.throw(SystemError);
    });
});

describe('Testing DigitalOcean API to set records', () => {
    it('Sending a non-valid domain should throw a system error', () => {
        (() => {
            Records.get('charlesmathieuseguin', 'test', '0.0.0.0', () => {});
        }).should.throw(SystemError);
    });

    it('Sending a non-valid record should throw a system error', () => {
        (() => {
            Records.get('charlesmathieuseguin.com', 1, '0.0.0.0', () => {});
        }).should.throw(SystemError);
    });

    it('Sending a non-valid ip should throw a system error', () => {
        (() => {
            Records.get('charlesmathieuseguin.com', 'test', '0.0.0', () => {});
        }).should.throw(SystemError);
    });
});

describe('Testing the stoage model', () => {
    it('Should create a file if none exists', () => {

    });
});
