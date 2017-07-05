let list_1v4 = require("../san-whitelist-1v4.js");
let list_1v5 = require("../san-whitelist-1v5.js");
let diff_1v4_1v5 = require("../san-whitelist-1v4-1v5-diff.js");
let Promise = require("bluebird");

describe.only('test update lists 1v4 => 1v5', function(accounts) {
    let map_1v4;
    let map_1v5;
    let map_diff_1v4_1v5;

    function asMap(list){
        let map = new Map();
        list.forEach((e,i) => {
            assert.notOk(map.has(e.addr), "duplicate found: #"+i+", addr: "+e.addr);
            map.set(e.addr , {min:e.min,max:e.max});
        });
        assert.equal(map.size, list.length, "sizes do not match");
        return map;
    }

    it('list 1v4 should contain no duplicates', function(){
        map_1v4 = asMap(list_1v4);
    });

    it('list 1v5 should contain no duplicates', function(){
        map_1v5 = asMap(list_1v5);
    });

    it('list diff_1v4_1v5 should contain no duplicates', function(){
      map_diff_1v4_1v5 = asMap(diff_1v4_1v5);
    });

    it('1v4 + 1v4_1v5_diff ==> 1v5 ', function(){
      let map = asMap(list_1v4);
      diff_1v4_1v5.forEach((e,i) => {
          if (map.has(e.addr) && e.max == 0) {
              map.delete(e.addr);
              return;
          }
          map.set(e.addr,  {min:e.min, max:e.max});
      });
      assert.equal(list_1v5.length, map.size, "unexpected 1v5 list size");

      list_1v5.forEach((e,i) => {
          assert.ok(map.has(e.addr) && map.get(e.addr).max == e.max && map.get(e.addr).min == e.min, "addr:"+e.addr);
          map.delete(e.addr);
      });
      assert.equal(0, map.size, "diff has not applied keys: ");
      for(e of map.keys()) { console.log(e); }
    });

});
