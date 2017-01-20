const chai = require('chai');
const nock = require('nock');

const Records = require('../models/records');

const expect = chai.expect;

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

    afterEach(() => {
        Records._requestTimeout = 10000;
        nock.cleanAll();
    });

    it('Should return a response of 200', () => {
        expect(response.statusCode).to.be.equal(200);
    });

    it('Should return an array', () => {
        expect(records).to.be.an('array');
    });

    it('Sending an int for domain should throw a system error', () => {
        return expect(Records.get(1, 'home')).to.eventually.be.rejected;
    });

    it('Sending an array for domain should throw a system error', () => {
        return expect(Records.get(['charlesmathieuseguin.com'])).to.eventually.be.rejected;
    });

    it('Sending a non-valid domain should throw a system error', () => {
        return expect(Records.get('charlesmathieuseguin')).to.eventually.be.rejected;
    });

    it('Should not exit if timeouts', () => {
        // Make sure the ip model requests will timeout
        Records._requestTimeout = 25;

        // Intercept the requests and return way after the timeout
        nock(Records._endpoint)
            .get(Records._buildGetPath('charlesmathieuseguin.com'))
            .query(true)
            .delay({ 'head': 200 });

        // Make the request
        return expect(Records.get()).to.eventually.be.rejected;
    });
});

describe('Testing DigitalOcean API to set records', () => {
    it('Sending a non-valid domain should throw a system error', () => {
        return expect(Records.set('charlesmathieuseguin', 'test', '0.0.0.0')).to.eventually.be.rejected;
    });

    it('Sending a non-valid record should throw a system error', () => {
        return expect(Records.set('charlesmathieuseguin.com', 'test', '0.0.0.0')).to.eventually.be.rejected;
    });

    it('Sending a non-valid ip should throw a system error', () => {
        return expect(Records.set('charlesmathieuseguin.com', 1, '0.0.0')).to.eventually.be.rejected;
    });

    it('Sending a valid ip but non valid records should throw an error', () => {
        return expect(Records.set('charlesmathieuseguin.com', 1, '137.175.144.52')).to.eventually.be.rejected;
    });

    it('Should not exit if timeouts', () => {
        // Make sure the ip model requests will timeout
        Records._requestTimeout = 25;

        // Intercept the requests and return way after the timeout
        nock(Records._endpoint)
            .get(Records._buildSetPath('charlesmathieuseguin.com', 1))
            .query(true)
            .delay({ 'head': 200 });

        // Make the request
        return expect(Records.get()).to.eventually.be.rejected;
    });
});
