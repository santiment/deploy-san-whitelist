pragma solidity ^0.4.11;
contract MinMaxWhiteList {

    string constant public VERSION = "0.2.0";

    function () { throw; }   //explicitly unpayable

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
            var addr = addrs[i];
            var max  = maxs[i];
            var min  = mins[i];
            Limit lim = allowed[addr];
            //remove old record if exists
            if (lim.max > 0) {
                controlSum -= uint160(addr) + lim.min + lim.max;
                delete allowed[addr];
            }
            //insert record if max > 0
            if (max > 0) {
                // max > 0 means add a new record into the list.
                allowed[addr] = Limit({min:min, max:max});
                controlSum += uint160(addr) + min + max;
            }
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
