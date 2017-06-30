var SantimentWhiteListUser = artifacts.require("./SantimentWhiteListUser.sol");
var SantimentWhiteList = artifacts.require("./SantimentWhiteList.sol");
let limitList = require("../san-whitelist-1v2.js");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');
module.exports = function(done) {

    function toFinney(num) {
        assert (num >=0 && num <= 20**24-1);
        return Math.round(num * 1000);
    }

    let whiteList;
    let sum = new BigNumber(0);
    return SantimentWhiteList.at("0xd2675d3ea478692ad34f09fa1f8bda67a9696bf7")
    .then(whiteList=>{
        return SantimentWhiteListUser.at("0xE7c2AD4edfaa7d30126DD85b33be2EaD7fbDe32e")//v 0.3.1 livenet
        .then(whiteListUser => {
            return Promise.each(limitList, (e, n, len) => {
                let min = toFinney(e.min);
                let max = toFinney(e.max);
                return whiteListUser.assert.call(whiteList.address,e.addr,min,max)
                   .then(() => {
                        if (n % 100 == 99 || n == len-1) {
                            console.log('Verified ', n+1, ' addresses ');
                        }
                        sum = sum.plus(e.addr).plus(min).plus(max);
                   }).catch(()=>{
                     console.log('Failure at address', n, ', addr:',e.addr, min, max);
                   });
            }).then(() => whiteList.controlSum()).then(_sum => {
                assert.equal(_sum.toString(),sum.toString(),"control sum mismatch");
                console.log("Control sum verified successfully");
            });
        });
    });
};
