var $ = require('tinyselector');

function Items(arr) {
  this._ = {};
  if( $.util.isArrayLike(arr) ) {
    var self = this;
    [].forEach.call(arr, function(item) {
      self.add(item);
    });
  }
}

var proto = Items.prototype = [];

proto.push = function() {
  var self = this;
  [].forEach.call(arguments, function(item) {
    if( item && item.id ) self._[item.id] = item;
  });
  
  return [].push.apply(this, arguments);
};

proto.add = function(item) {
  if( $.util.isArrayLike(item) ) {
    var self = this;
    [].forEach.call(item, function(item) {
      self.push(item);
    });
  } else {
    this.push(item);
  }
  
  return this;
};

proto.get = function(id) {
  return this._[id];
};

proto.remove = function(item) {
  if( ~['string', 'number'].indexOf(typeof item) ) item = this._[item];
  if( !item ) return this;
  for(var pos;~(pos = this.indexOf(item));) this.splice(pos, 1);
  return this;
};

proto.clear = function() {
  this.splice(0, this.length);
  return this;
};

module.exports = Items;