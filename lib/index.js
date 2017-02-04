var Editor = require('./editor/');
var Part = require('./editor/part.js');
var HTMLPart = require('./editor/types/html/html.js');
var ImagePart = require('./editor/types/image/image.js');
var Toolbar = require('./editor/toolbar.js');
var Types = require('./editor/types.js');
var connect = require('./connect/');

var editor;
var emptykey = {};
var ctx = module.exports = {
  Part: Part,
  HTMLPart: HTMLPart,
  ImagePart: ImagePart,
  Toolbar: Toolbar,
  connect: connect,
  editor: function(el) {
    if( !arguments.length ) {
      return editor = editor || new Editor();
    }
    
    return el.__ffeditor__ = el.__ffeditor__ || new Editor(el);
  },
  endpoint: function(url) {
    connect.endpoint(url);
    return this;
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
