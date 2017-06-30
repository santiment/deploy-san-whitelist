let SantimentWhiteList = artifacts.require("./SantimentWhiteList.sol");
let SantimentWhiteListUser = artifacts.require("./SantimentWhiteListUser.sol");
//let limitList = require("../san-whitelist-example-10lines.js");
let limitList = require("../san-whitelist-1v2.js");
let Promise = require("bluebird");
let BigNumber = require('bignumber.js');
const eth = require('ethereum-address');
const BLOCK_LEN = 160;

contract('SantimentWhiteList', function(accounts) {
    let whiteList;
    let chunkNr=0;
    let sum_max=0;
    let gasUsed=0;

    before('should find no duplicates (case insensitive!) in the limitList', function(){
        let seenAddr = new Set();
        let duplicates = [];
        limitList.forEach(e => {
            assert.ok(eth.isAddress(e.addr));
            let low_addr = e.addr.toLowerCase();
            if (e.max == 0) console.log("WARN: max==0 for addr:"+e.addr);
            else sum_max+=e.max;
            if (seenAddr.has(low_addr)) duplicates.push(e.addr)
            else seenAddr.add(low_addr);
        });
        console.log("SUM of all max values is: ", sum_max);
        assert.deepEqual([],duplicates,"duplicates found!");

    });

    it('should fail to send ether to contract', function(done){
        SantimentWhiteList.deployed().then(_whiteList => {
            web3.eth.send(_whiteList, {from:accounts[0], value:1});
        })
        .then (tx    => done("payment shoudl fail!"))
        .catch(error => done());
    });

    it('should successfull populate addresses', function(){
        return SantimentWhiteList.deployed()
        .then(_whiteList => {
            whiteList = _whiteList;
            let promises = [];
            let args = [];
            for(let i=0; i < limitList.length; i+=BLOCK_LEN) {
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
            return Promise.each(args, function(arg) {
                return whiteList.addPack(arg.addrs, arg.mins, arg.maxs, chunkNr++, {gas:4600000}).then(tx => {
                  //console.log("gasUsed:", tx.receipt.gasUsed,", cumulativeGasUsed:", tx.receipt.cumulativeGasUsed);
                  gasUsed += tx.receipt.gasUsed;
                  console.log('Uploaded chunk ', chunkNr-1, ', length: ', arg.addrs.length);
                });
            }).then(()=>whiteList.start());
        });
    });

    it("should be impossible to add more addresses after start (setupMode==false)", function(done) {
        let extraPack = [whiteList.address];
        whiteList.addPack(extraPack, chunkNr++, {gas:4700000})
        .then (tx    => done("exception expected"))
        .catch(error => done())
    });

    it("should contains all addresses if accessed by SantimentWhiteListUser.assert(addr)", function() {
        let sum = new BigNumber(0);
        return SantimentWhiteListUser.deployed().then(whiteListUser => {
            return Promise.each(limitList, (e, n, len) => {
                let min = toFinney(e.min);
                let max = toFinney(e.max);
                return whiteListUser.assert(whiteList.address,e.addr,min,max)
                   .then(() => {
                        if (n % 100 == 99 || n == len-1) {
                            console.log('Verified ', n+1, ' addresses ');
                        }
                        sum = sum.plus(e.addr).plus(min).plus(max);
                   }).catch((e)=>{
                     //console.log(e);
                     console.log('Failure at address', n, ', addr:',e.addr, min, max);
                   });
            }).then(() => whiteList.controlSum()).then(_sum => {
                assert.equal(_sum.toString(),sum.toString(),"control sum mismatch");
            });
        });
    });

    it("print statistic", function(){
        console.log('approx. gasUsage: ', gasUsed);
        console.log('chunks uploaded: ', chunkNr);
    });

    function toFinney(num) {
        assert (num >=0 && num <= 20**24-1);
        return Math.round(num * 1000);
    }
});
