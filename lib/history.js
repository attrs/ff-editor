var $ = require('tinyselector');
var context = require('./context.js');
var list = [];
var redos = [];
var size = 50;
var current;

function redo() {
  var action = redos.shift();
  if( action ) {
    list.push(action);
    if( current === action ) return redo.call(this);
    action.call(context);
    current = action;
  }
  return this;
}

function undo() {
  var action = list.pop();
  if( action ) {
    redos.unshift(action);
    if( current === action ) return undo.call(this);
    action.call(context);
    current = action;
  }
  return this;
}

function add(action) {
  if( typeof action != 'function' ) return console.error('[ff] illegal argument, action must be a function');
  list.push(action);
  redos = [];
  current = action;
  
  if( list.length > size )
    list = list.slice(list.length - size);}

function list() {
  return list;
}

function size(size) {
  if( !arguments.length ) return size;
  size = Math.abs(+size) || 50;
  return this;
}

module.exports = {
  size: size,
  add: add,
  undo: undo,
  redo: redo,
  list:  list
};

// add keydown listener to document
var platform = window.navigator.platform;
var mac = !!~platform.toLowerCase().indexOf('mac');

$(document).on('keydown', function(e) {
  if( !context.editmode() ) return;
  
  if( mac ) {
    if( e.metaKey && e.key == 'z' ) undo();
    else if( e.metaKey && e.shiftKey && e.key == 'Z' ) redo();
    else return;
  } else {
    if( e.ctrlKey && e.key == 'z' ) undo();
    else if( e.ctrlKey && e.key == 'y' ) redo();
    else return;
  }
  e.preventDefault();
}, true);