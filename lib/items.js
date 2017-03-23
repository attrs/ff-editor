function Items() {}

var proto = Items.prototype = [];

proto.add = function(item) {
  this.push(item);
  return this;
};

proto.remove = function(item) {
  for(var pos;~(pos = this.indexOf(item));) this.splice(pos, 1);
  return this;
};

module.exports = Items;