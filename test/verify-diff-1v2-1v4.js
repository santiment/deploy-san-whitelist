let list_1v2 = require("../san-whitelist-1v2.js");
let list_1v3 = require("../san-whitelist-1v3.js");
let list_1v4 = require("../san-whitelist-1v4.js");
let diff_1v2_1v4 = require("../san-whitelist-1v2-1v4-diff.js");
let Promise = require("bluebird");

describe.only('test update lists', function(accounts) {
    let map_1v2;
    let map_1v3;
    let map_1v4;
    let map_diff_1v2_1v4;

    function asMap(list){
        let map = new Map();
        list.forEach((e,i) => {
            assert.notOk(map.has(e.addr), "duplicate found: #"+i+", addr: "+e.addr);
            map.set(e.addr , {min:e.min,max:e.max});
        });
        assert.equal(map.size, list.length, "sizes do not match");
        return map;
    }

    it('list 1v4 has minimum', function(){
        let min=1000;
        list_1v4.forEach(e=>min=e.min<min?e.min:min);
        console.log('min>', min);
    });

    it('list 1v2 should contain no duplicates', function(){
        map_1v2 = asMap(list_1v2);
    });

    it('list 1v3 should contain no duplicates', function(){
        map_1v3 = asMap(list_1v3);
    });

    it('list 1v4 should contain no duplicates', function(){
        map_1v4 = asMap(list_1v4);
    });

    it('list diff_1v2_1v4 should contain no duplicates', function(){
      map_diff_1v2_1v4 = asMap(diff_1v2_1v4);
    });

    it('1v2 + 1v2_1v4_diff ==> 1v4 ', function(){
      let map = asMap(list_1v2);
      diff_1v2_1v4.forEach((e,i) => {
          if (map.has(e.addr) && e.max == 0) {
              map.delete(e.addr);
              return;
          }
          map.set(e.addr,  {min:e.min, max:e.max});
      });
      assert.equal(list_1v4.length, map.size, "unexpected 1v4 list size");

      list_1v4.forEach((e,i) => {
          assert.ok(map.has(e.addr) && map.get(e.addr).max == e.max && map.get(e.addr).min == e.min, "addr:"+e.addr);
          map.delete(e.addr);
      });
      assert.equal(0, map.size, "diff has not applied keys");
    });

});
