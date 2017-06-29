var SantimentWhiteList = artifacts.require("./SantimentWhiteList.sol");
let limitList = require("../san-whitelist-1v1.js");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');
module.exports = function(done) {

    function toFinney(num) {
        assert (num >=0 && num <= 20**24-1);
        return Math.round(num * 1000);
    }
    let whiteList;
    let chunkNr=3;
    let sum_max=0;
    let gasUsed=0;
    const BLOCK_LEN = 160;
    let args = [];
    //return SantimentWhiteList.at("0x639F931DA0E80D958919310745BbF3871Cb20b43")
    //return SantimentWhiteList.at("0xb3af6cc03212e659ebf2996fd34f68ebafe34c78")
    return SantimentWhiteList.at("0x92e55C6EE3171779174cEbb27211120B730C155c") // version 0.3.0: livenet
        .then(_whiteList => {
            whiteList = _whiteList;
            return whiteList.recordNum();
        }).then(bn_recordNum => {
            let recordNum = bn_recordNum.toNumber();
            console.log('recordNum: ', recordNum);
            let promises = [];
            for(let i=recordNum; i < limitList.length; i+=BLOCK_LEN) {
                let addrs = [];
                let mins = [];
                let maxs = [];
                limitList.slice(i,i+BLOCK_LEN).forEach(e => {
                    addrs.push(e.addr);
                    mins.push(toFinney(e.min));
                    maxs.push(toFinney(e.max));
                });
                args.push({addrs:addrs, mins:mins, maxs:maxs});
            }
            console.log('before estimate gas');
            return whiteList.addPack.estimateGas(args[0].addrs, args[0].mins, args[0].maxs, chunkNr);
        }).then(gas => {
            console.log('gas: ', gas);
            return Promise.each(args, function(arg) {
                return whiteList.addPack(arg.addrs, arg.mins, arg.maxs, chunkNr++, {gas:gas}).then(tx => {
                  //console.log("gasUsed:", tx.receipt.gasUsed,", cumulativeGasUsed:", tx.receipt.cumulativeGasUsed);
                  gasUsed += tx.receipt.gasUsed;
                  console.log('Uploaded chunk ', chunkNr-1, ', length: ', arg.addrs.length);
                });
            }).then(()=> whiteList.chunkNr())
            .then(chunkNr => {
              console.log('chunkNr: ',chunkNr);
              console.log('gasUsed: ',gasUsed);
              done();
            });
        });
};
