var SantimentWhiteList = artifacts.require("./SantimentWhiteList.sol");
//let limitList = require("../san-whitelist-1v5.js");
let limitList = require("../san-whitelist-1v6.js").slice(450);
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
let assert = require('assert');

const UPDATE_MODE = true;

module.exports = function(done) {

    function toFinney(num) {
        assert (num >=0 && num <= 20**24-1);
        return Math.round(num * 1000);
    }
    let whiteList;
    let chunkNr=0;
    let recordNum=0;
    let sum_max=0;
    let gasUsed=0;
    const BLOCK_LEN = 100;
    let args = [];
    //return SantimentWhiteList.at("0x639F931DA0E80D958919310745BbF3871Cb20b43")
    //return SantimentWhiteList.at("0xb3af6cc03212e659ebf2996fd34f68ebafe34c78")
    //return SantimentWhiteList.at("0x92e55C6EE3171779174cEbb27211120B730C155c") // version 0.3.0: livenet
    //return SantimentWhiteList.at("0xb3af6cc03212e659ebf2996fd34f68ebafe34c78") // =====> testrpc
    return SantimentWhiteList.at("0xd2675d3ea478692ad34f09fa1f8bda67a9696bf7") // version 0.3.1: livenet
    //return SantimentWhiteList.deployed()
        .then(_whiteList => {
            whiteList = _whiteList;
            return Promise.all([whiteList.recordNum(),whiteList.chunkNr()])
        }).then(bn_nums => {
            recordNum = bn_nums[0].toNumber();
            chunkNr = bn_nums[1].toNumber();
            console.log('recordNum: ', recordNum);
            console.log('chunkNr: ', chunkNr);
            let promises = [];
            for(let i= UPDATE_MODE ? 0 : recordNum; i < limitList.length; i+=BLOCK_LEN) {
                let addrs = [];
                let mins = [];
                let maxs = [];
                limitList.slice(i,i+BLOCK_LEN).forEach(e => {
                    addrs.push(e.addr);
                    mins.push(toFinney(0.2));
                    maxs.push(toFinney(e.max));
                });
                args.push({addrs:addrs, mins:mins, maxs:maxs});
            }
            console.log('before estimate gas');
            return whiteList.addPack.estimateGas(args[0].addrs, args[0].mins, args[0].maxs, chunkNr);
        }).then(gas => {
            console.log('gas: ', gas);
            return Promise.each(args, function(arg) {
                return whiteList.addPack(arg.addrs, arg.mins, arg.maxs, chunkNr++, {gas:gas+20000}).then(tx => {
                  //console.log("gasUsed:", tx.receipt.gasUsed,", cumulativeGasUsed:", tx.receipt.cumulativeGasUsed);
                  gasUsed += tx.receipt.gasUsed;
                  console.log('Uploaded chunk ', chunkNr-1, ', length: ', arg.addrs.length);
                });
            }).then(()=> whiteList.chunkNr())
            .then(chunkNr => {
              console.log('chunkNr: ',chunkNr.toNumber());
              console.log('gasUsed: ',gasUsed);
              done();
            });
        });
};
