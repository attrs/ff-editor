var $ = require('tinyselector');
var Part = require('../../part.js');
var path = require('path');

require('./file.less');

function FilePart() {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-file');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-justify"></i>',
    tooltip: '정렬',
    onupdate: function() {
      var btn = this;
      if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
      else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
      else if( btn.align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
      else btn.text('<i class="fa fa-align-justify"></i>');
    },
    fn: function(e) {
      var btn = this;
      if( btn.align == 'center' ) {
        el.css('text-align', 'right');
        btn.align = 'right';
      } else if( btn.align == 'right' ) {
        el.css('text-align', 'left');
        btn.align = 'left';
      } else if( btn.align == 'left' ) {
        el.css('text-align', '');
        btn.align = '';
      } else {
        el.css('text-align', 'center');
        btn.align = 'center';
      }
    }
  });
}

FilePart.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      var def = FilePart.defaultLabel;
      var href = arg && (arg.src || arg.href);
      var label = arg && (arg.name || arg.title || arg.label) || def;
      
      if( typeof href !== 'string' ) href = null;
      if( typeof label !== 'string' ) label = def;
      
      return $('<div/>').append($('<a href="' + (href || 'javascript:;') + '" target="_blank"/>').html(label))[0];
    }
  }
});

FilePart.defaultLabel = 'Download';

module.exports = FilePart;