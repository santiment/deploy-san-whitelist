var SantimentWhiteList = artifacts.require("./SantimentWhiteList.sol");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');

module.exports = function(done) {

    //return SantimentWhiteList.at("0x639F931DA0E80D958919310745BbF3871Cb20b43") // version 0.2.0: livenet
    //return SantimentWhiteList.at("0x92e55C6EE3171779174cEbb27211120B730C155c") // version 0.3.0: livenet
    //return SantimentWhiteList.at("0xb3af6cc03212e659ebf2996fd34f68ebafe34c78") //testrpc
    return SantimentWhiteList.at("0xd2675d3ea478692ad34f09fa1f8bda67a9696bf7") // version 0.3.1: livenet
        .then(whiteList => {
            return whiteList.VERSION().then(version => {
              console.log('version: ',version);
              return whiteList.ping.estimateGas();
            }).then(gas => {
              console.log('gas: ',gas);
              return whiteList.ping({gas:gas+10000}); //ping is not deployed in ver 0.3.1
            }).then(tx => {
              console.log('tx: ',tx);
            }).then(()=> whiteList.chunkNr())
              .then(chunkNr => {
              console.log('chunkNr: ',chunkNr.toNumber());
              done();
            });
        });
};
