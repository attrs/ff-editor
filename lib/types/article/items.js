module.exports = function() {
  return (function() {
    var items = [];
  
    items.add = function(item) {
      items.push(item);
      return this;
    };
  
    items.remove = function(item) {
      for(var pos;~(pos = items.indexOf(item));) items.splice(pos, 1);
      return this;
    };
  
    return items;
  })();
};