var $ = require('tinyselector');
var Part = require('../../part.js');

require('./separator.less');

function Separator() {
  Part.apply(this, arguments);
  
  var part = this;
  var el = $(this.dom());
  
  this.toolbar().add({
    text: '<i class="fa fa-chevron-up"></i>',
    tooltip: '모양',
    onupdate: function(btn) {
      var part = this;
      var shape = part.shape();
      if( shape == 'dotted' ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( shape == 'dashed' ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( shape == 'zigzag' ) btn.text('<i class="fa fa-chevron-up"></i>');
      else if( shape == 'line' ) btn.text('<i class="fa fa-minus"></i>');
      else btn.text('<i class="fa fa-minus"></i>');
    },
    fn: function(btn) {
      var part = this;
      var shape = part.shape();
      
      if( shape == 'dotted' ) part.shape('dashed');
      else if( shape == 'dashed' ) part.shape('zigzag');
      else if( shape == 'zigzag' ) part.shape('line');
      else if( shape == 'line' ) part.shape(false);
      else part.shape('dotted');
      part.history().save();
    }
  })
  .add({
    text: '<i class="fa fa-arrows-h"></i>',
    tooltip: '너비',
    onupdate: function(btn) {
      var part = this;
      
      if( part.shape() === false ) return btn.hide();
      btn.show();
      if( el.hc('f_sep_narrow') ) btn.text('<i class="fa fa-minus"></i>');
      else btn.text('<i class="fa fa-arrows-h"></i>');
    },
    fn: function(e) {
      el.tc('f_sep_narrow');
      part.history().save();
    }
  });
}

var proto = Separator.prototype = Object.create(Part.prototype);

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