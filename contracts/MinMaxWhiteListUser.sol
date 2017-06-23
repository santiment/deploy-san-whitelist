pragma solidity ^0.4.11;
import  './MinMaxWhiteList.sol';

contract MinMaxWhiteListUser {
    MinMaxWhiteList whiteList;

    function MinMaxWhiteListUser(MinMaxWhiteList _whiteList) {
        whiteList = _whiteList;
    }

    function assert(address addr, uint24 _min, uint24 _max) external {
        var (min, max) = whiteList.allowed(addr);
        assert ( min == _min && max == _max );
    }

}
