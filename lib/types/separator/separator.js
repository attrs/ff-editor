var $ = require('tinyselector');
var Part = require('../../part.js');

require('./separator.less');

function Separator() {
  Part.apply(this, arguments);
  
  var part = this;
  var el = $(this.dom()).ac('ff-separator');
  
  this.toolbar().add({
    text: '<i class="fa fa-chevron-up"></i>',
    tooltip: '모양',
    onupdate: function(btn) {
      var part = this;
      var shape = part.shape();
      if( shape == 'dotted' ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( shape == 'dashed' ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( shape == 'zigzag' ) btn.text('<i class="fa fa-chevron-up"></i>');
      else if( shape == 'empty' ) btn.text('<i class="fa fa-asterisk"></i>');
      else btn.text('<i class="fa fa-minus"></i>');
    },
    fn: function(btn) {
      var part = this;
      var shape = part.shape();
      
      if( shape == 'dotted' ) part.shape('dashed');
      else if( shape == 'dashed' ) part.shape('zigzag');
      else if( shape == 'zigzag' ) part.shape('empty');
      else if( shape == 'empty' ) part.shape(false);
      else part.shape('dotted');
    }
  })
  .add({
    text: '<i class="fa fa-arrows-h"></i>',
    tooltip: '너비',
    onupdate: function(btn) {
      var part = this;
      if( el.hc('f_sep_narrow') ) btn.text('<i class="fa fa-minus"></i>');
      else btn.text('<i class="fa fa-arrows-h"></i>');
    },
    fn: function(e) {
      el.tc('f_sep_narrow');
    }
  })
  .add({
    text: '<i class="fa fa-asterisk"></i>',
    tooltip: '플로트 취소',
    onupdate: function(btn) {
      btn.active(el.hc('f_sep_clearfix'));
    },
    fn: function(e) {
      el.tc('f_sep_clearfix');
    }
  });
}

var proto = Separator.prototype = Object.create(Part.prototype);

proto.create = function(arg) {
  return $('<hr/>')[0];
};

proto.shape = function(shape) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_sep_dotted') ? 'dotted' : 
    el.hc('f_sep_dashed') ? 'dashed' : 
    el.hc('f_sep_zigzag') ? 'zigzag' : 
    el.hc('f_sep_empty') ? 'empty' : false;

  el.rc('f_sep_dotted f_sep_dashed f_sep_zigzag f_sep_empty');
  if( shape == 'dotted' ) el.ac('f_sep_dotted');
  else if( shape == 'dashed') el.ac('f_sep_dashed');
  else if( shape == 'zigzag') el.ac('f_sep_zigzag');
  else if( shape == 'empty') el.ac('f_sep_empty');
  
  return this;
};


module.exports = Separator;