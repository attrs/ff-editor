var $ = require('tinyselector');
var Part = require('../../part.js');
var tools = require('../../tools.js');
var Items = require('../../items.js');

require('./separator.less');

function Separator() {
  Part.apply(this, arguments);
}

var proto = Separator.prototype = Object.create(Part.prototype);
var items = Separator.toolbar = new Items([
  tools.separator.shape,
  tools.separator.width
]);

proto.oninit = function() {
  var part = this;
  var el = $(this.dom());
  
  this.toolbar().add(items);
};

proto.create = function(arg) {
  return $('<hr/>').ac('f_sep')[0];
};

proto.shape = function(shape) {
  var el = $(this.dom());
  if( !arguments.length ) return !el.hc('f_sep') ? false : el.hc('f_sep_dotted') ? 'dotted' : 
    el.hc('f_sep_dashed') ? 'dashed' : 
    el.hc('f_sep_zigzag') ? 'zigzag' : 'line';
  
  el.ac('f_sep').rc('f_sep_dotted f_sep_dashed f_sep_zigzag');
  
  if( shape === false ) el.rc('f_sep');
  else if( shape == 'dotted' ) el.ac('f_sep_dotted');
  else if( shape == 'dashed') el.ac('f_sep_dashed');
  else if( shape == 'zigzag') el.ac('f_sep_zigzag');
  
  return this;
};


module.exports = Separator;