var tools = require('../../tools.js');
var $ = require('tinyselector');
var Toolbar = require('../../toolbar/');
var ParagraphPart = require('../paragraph/paragraph.js');
var Items = require('../../items.js');

function HeadingPart() {
  ParagraphPart.apply(this, arguments);
}

var proto = HeadingPart.prototype = Object.create(ParagraphPart.prototype);
var items = ParagraphPart.toolbar = new Items([
  tools.heading,
  tools.align,
  tools.draggable
]);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.create = function(arg) {
  var tag = 'h1';
  var html = typeof arg == 'string' ? arg : '';
  
  if( arg && typeof arg == 'object' ) {
    tag = arg.tag || 'h1';
    html = arg.html;
  }
  
  return $('<' + tag + '/>').html(html)[0];
};

module.exports = HeadingPart;