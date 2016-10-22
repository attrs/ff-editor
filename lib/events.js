module.exports = function(scope) {
  var listeners = {};
  
  var on = function(type, fn) {
    listeners[type] = listeners[type] || [];
    listeners[type].push(fn);
    return this;
  };
  
  var once = function(type, fn) {
    var wrap = function(e) {
      off(type, wrap);
      return fn.call(this, e);
    };
    body.on(type, wrap);
    return this;
  };
  
  var off = function(type, fn) {
    var fns = listeners[type];
    if( fns ) for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
    return this;
  };
  
  var emit = function(type, value) {
    var fns = listeners[type];
    (fns || []).forEach(function(fn) { fn.call(scope || this, value) });
    return this;
  };
  
  return {
    on: on,
    once: once,
    off: off,
    emit: emit
  };
};