const chai = require('chai');
const nock = require('nock');
const should = chai.should();
const Ip = require('../models/ip');
const Records = require('../models/records');

const ipregex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/;

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
    })
});
