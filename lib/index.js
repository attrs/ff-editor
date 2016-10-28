var Editor = require('./editor/');
var Part = require('./editor/part.js');
var HTMLPart = require('./editor/types/html.js');
var ImagePart = require('./editor/types/image.js');
var Types = require('./editor/types.js');
var connect = require('./connect/');

var editors = new WeakMap();
var emptykey = {};
var ctx = module.exports = {
  Part: Part,
  HTMLPart: HTMLPart,
  ImagePart: ImagePart,
  editor: function(el) {
    var key = el || emptykey;
    if( editors.has(key) ) return editors.get(key);
    editors.set(key, new Editor(el));
    return editors.get(key);
  },
  type: function(type, fn) {
    if( !arguments.length ) return console.error('missing type name');
    if( arguments.length === 1 ) return Part.types.get(type);
    Part.types.add(type, fn);
    return this;
  }
};


ctx.type('html', ctx.HTMLPart);
ctx.type('image', ctx.ImagePart);
