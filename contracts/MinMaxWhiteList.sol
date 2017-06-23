pragma solidity ^0.4.11;
contract MinMaxWhiteList {
    struct Limit {
        uint24 min;  //ethers
        uint24 max;  //ethers
    }

    struct LimitWithAddr {
        address addr;
        uint24 min; //ethers
        uint24 max; //ethers
    }

    mapping(address=>Limit) public allowed;
    uint16  public chunkNr = 0;
    uint256 public controlSum = 0;
    bool public isSetupMode = true;
    address public admin;

    function MinMaxWhiteList() { admin = msg.sender; }

    //adds next address package to the internal white list.
    //call valid only in setup mode.
    function addPack(address[] addrs, uint24[] mins, uint24[] maxs, uint16 _chunkNr)
    setupOnly
    adminOnly
    external {
        var len = addrs.length;
        require ( chunkNr++ == _chunkNr);
        require ( mins.length == len &&  mins.length == len );
        for(uint16 i=0; i<len; ++i) {
            allowed[addrs[i]] = Limit({min:mins[i], max:maxs[i]});
            controlSum += uint160(addrs[i]) + mins[i] + maxs[i];
        }
    }

    //disable setup mode
    function start() public {
        isSetupMode = false;
    }

    modifier setupOnly {
        if ( !isSetupMode ) throw;
        _;
    }

    modifier adminOnly {
        if (msg.sender != admin) throw;
        _;
    }
}
