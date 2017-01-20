const chai = require('chai');
const nock = require('nock');

const Ip = require('../models/ip');

const expect = chai.expect;
const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;

const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

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

    afterEach(() => {
        Ip._requestTimeout = 10000;
        nock.cleanAll();
    });

    it('Should return a response of 200', () => {
        expect(response.statusCode).to.equal(200);
    });

    it('Ip address should have a valid ipv4 format', () => {
        expect(ipAddress).to.match(ipregex);
    });

    it('Should not exit if timeouts', () => {
        // Make sure the ip model requests will timeout
        Ip._requestTimeout = 25;

        // Intercept the requests and return way after the timeout
        nock(Ip._endpoint)
            .get(Ip.getPath)
            .query(true)
            .delay({ 'head': 200 });

        // Make the request
        return expect(Ip.get()).to.eventually.be.rejected;
    });
});
