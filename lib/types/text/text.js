var $ = require('tinyselector');
var ParagraphPart = require('../paragraph/paragraph.js');

function TextPart() {
  ParagraphPart.apply(this, arguments);
  this.toolbar().enable(false);
}

var proto = TextPart.prototype = Object.create(ParagraphPart.prototype);

proto.create = function(arg) {
  var html = typeof arg == 'string' ? arg : '';
  return $('<span/>').html(html)[0];
};

proto.html = ParagraphPart.prototype.text;

proto.multiline = function() {
  if( !arguments.length ) return false;
  return this;
};

module.exports = TextPart;