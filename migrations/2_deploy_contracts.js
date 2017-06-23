var MinMaxWhiteList = artifacts.require("./MinMaxWhiteList.sol");
var MinMaxWhiteListUser = artifacts.require("./MinMaxWhiteListUser.sol");
module.exports = function(deployer, network) {
    deployer.deploy(MinMaxWhiteList).then( function() {
        return MinMaxWhiteList.deployed();
    }).then(whiteList => {
        return deployer.deploy(MinMaxWhiteListUser,whiteList.address);
    });
};
