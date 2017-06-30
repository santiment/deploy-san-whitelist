pragma solidity ^0.4.11;

contract _SantimentWhiteList {
    function allowed(address) public returns(uint24, uint24);
}

contract SantimentWhiteListUser {

    function assert(_SantimentWhiteList whiteList, address addr, uint24 _min, uint24 _max) constant external {
        var (min, max) = whiteList.allowed(addr);
        assert ( min == _min && max == _max );
    }

}
