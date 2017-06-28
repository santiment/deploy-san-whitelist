pragma solidity ^0.4.11;
import  './SantimentWhiteList.sol';

contract SantimentWhiteListUser {
    SantimentWhiteList whiteList;

    function SantimentWhiteListUser(SantimentWhiteList _whiteList) {
        whiteList = _whiteList;
    }

    function assert(address addr, uint24 _min, uint24 _max) external {
        var (min, max) = whiteList.allowed(addr);
        assert ( min == _min && max == _max );
    }

}
