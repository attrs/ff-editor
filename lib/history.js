var $ = require('tinyselector');

var win = window;
var timeoutid, timeoutfn;
var list = [];
var size = 50;
var index = -1;
var processing = false;

var redo = function() {
  processing = true;
  var action =  next();
  if( action ) {
    //console.log('redo', index);
    action.call(scope, redo);
  }
  processing = false;
  return scope;
};

var undo = function() {
  processing = true;
  var action =  prev();
  if( action ) {
    //console.log('undo', index);
    action.call(scope, undo);
  }
  processing = false;
  return scope;
};

var prev = function() {
  index = index - 1;
  if( index < 0 ) index = -1;
  return list[index];
};

var next = function() {
  index = index + 1;
  if( index > list.length ) index = list.length;
  return list[index];
};

var add = function(action) {
  if( typeof action != 'function' ) return console.error('[ff] illegal argument, action must be a function');
  
  if( processing ) return;
  
  list.push(action);
  if( list.length > size )
    list = list.slice(list.length - size);
  
  index = list.length;
  //console.error('add', list.length);
  
  return scope;
};

var remove = function(action) {
  if( typeof action === 'number' ) action = list[action];
  for(var index;(index = list.indexOf(action)) >= 0;)
    list.splice(index, 1);
  
  return scope;
};

var scope = module.exports = {
  add: add,
  remove: remove,
  undo: undo,
  redo: redo,
  size: function(size) {
    if( !arguments.length ) return size;
    size = Math.abs(+size) || 50;
    return scope;
  },
  list:  function() {
    return list;
  },
  index: function() {
    return index;
  },
  clear: function() {
    list = [];
    index = -1;
    return this;
  }
};