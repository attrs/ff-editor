module.exports = function(flushfn, timeout) {
  if( typeof flushfn != 'function' || typeof timeout != 'number' || timeout < 0 )
    return console.error('illegal arguments');
  
  var tid;
  var buffer = [];
  var flush = function() {
    if( tid ) window.clearTimeout(tid);
    var items = buffer;
    buffer = [];
    flushfn(items);
  };
  
  var pusher = function(item) {
    buffer.push(item);
    if( tid ) window.clearTimeout(tid);
    tid = window.setTimeout(function() {
      flush();
    }, timeout);
  };
  
  pusher.flush = flush;
  return pusher;
};