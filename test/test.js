const chai = require('chai');
const should = chai.should();
const Ip = require('../models/ip');

describe('Getting the ip address', function() {
    it('Should return a response of 200', function(done) {
        Ip.get((ipAddress, response) => {
            response.statusCode.should.be.equal(200);
            done();
        });
    });

    it('Should return an ipv4 format of ip address', function(done) {
        Ip.get((ipAddress, response) => {
            ipAddress.should.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/);
            done();
        });
    });
});

describe('Getting the ip address', function() {
    it('Should return a response of 200', function(done) {
        Ip.get((ipAddress, response) => {
            response.statusCode.should.be.equal(200);
            done();
        });
    });
});
