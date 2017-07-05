let list_1v5 = require("../san-whitelist-1v5.js");
let list_1v6 = require("../san-whitelist-1v6.js");
let diff_1v5_1v6 = require("../san-whitelist-1v5-1v6-diff.js");
let Promise = require("bluebird");

describe.only('test update lists 1v5 => 1v6', function(accounts) {
    let map_1v5;
    let map_1v6;
    let map_diff_1v5_1v6;

    function asMap(list){
        let map = new Map();
        list.forEach((e,i) => {
            assert.notOk(map.has(e.addr), "duplicate found: #"+i+", addr: "+e.addr);
            map.set(e.addr , {min:e.min,max:e.max});
        });
        assert.equal(map.size, list.length, "sizes do not match");
        return map;
    }

    it('list 1v6 has minimum >0.2', function() {
        let min=Number.MAX_SAFE_INTEGER;
        list_1v6.forEach(e=>min=e.min<min?e.min:min);
        assert.isAtLeast(min,0.2,"min is too low")
        console.log('min>', min);
    });

    it('list 1v5 should contain no duplicates', function(){
        map_1v5 = asMap(list_1v5);
    });

    it('list 1v6 should contain no duplicates', function(){
        map_1v6 = asMap(list_1v6);
    });

    it('list diff_1v5_1v6 should contain no duplicates', function(){
      map_diff_1v5_1v6 = asMap(diff_1v5_1v6);
    });

    it('1v5 + 1v5_1v6_diff ==> 1v6 ', function(){
      let map = asMap(list_1v5);
      diff_1v5_1v6.forEach((e,i) => {
          if (map.has(e.addr) && e.max == 0) {
              map.delete(e.addr);
              return;
          }
          map.set(e.addr,  {min:e.min, max:e.max});
      });
      assert.equal(list_1v6.length, map.size, "unexpected 1v6 list size");

      list_1v6.forEach((e,i) => {
          assert.ok(map.has(e.addr) && map.get(e.addr).max == e.max && map.get(e.addr).min == e.min, "addr:"+e.addr);
          map.delete(e.addr);
      });
      assert.equal(0, map.size, "diff has not applied keys: ");
      for(e of map.keys()) { console.log(e); }
    });

});
