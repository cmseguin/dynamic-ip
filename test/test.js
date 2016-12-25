const chai = require('chai');
const nock = require('nock');

const Ip = require('../models/ip');
const Records = require('../models/records');
const SystemError = require('../errors/system-error');

const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;
const should = chai.should();

describe('Testing the ip address API', () => {
    let ipAddress;
    let response;

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
    })
});

describe('Testing DigitalOcean API', () => {
    let record;
    let response;

    before((done) => {
        Records.get('charlesmathieuseguin.com', 'home', (rec, res) => {
            record = rec;
            response = res;
            done();
        });
    });

    it('Should return a response of 200', () => {
        response.statusCode.should.be.equal(200);
    });

    it('Ip address should have a valid ipv4 format', () => {
        record.data.should.match(ipregex);
    });

    it('Sending an int for domain should throw a system error', () => {
        (() => {
            Records.get(1, 'home', () => {})
        }).should.throw(SystemError);
    });

    it('Sending an array for domain should throw a system error', () => {
        (() => {
            Records.get(['charlesmathieuseguin.com'], 'home', () => {})
        }).should.throw(SystemError);
    });

    it('Sending a none valid domain should throw a system error', () => {
        (() => {
            Records.get('charlesmathieuseguin', 'home', () => {})
        }).should.throw(SystemError);
    });

    it('Sending an int for record should throw a system error', () => {
        (() => {
            Records.get('charlesmathieuseguin.com', 1, () => {})
        }).should.throw(SystemError);
    });
});
