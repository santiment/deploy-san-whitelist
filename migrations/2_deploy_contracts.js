var SantimentWhiteList = artifacts.require("./SantimentWhiteList.sol");
var SantimentWhiteListUser = artifacts.require("./SantimentWhiteListUser.sol");
module.exports = function(deployer, network) {
    deployer.deploy(SantimentWhiteList).then( function() {
        return SantimentWhiteList.deployed();
    }).then(whiteList => {
        return deployer.deploy(SantimentWhiteListUser,whiteList.address);
    });
};
