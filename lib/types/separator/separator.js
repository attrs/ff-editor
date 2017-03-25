var $ = require('tinyselector');
var Part = require('../../part.js');

require('./separator.less');

function Separator() {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-separator');
  
  this.toolbar().add({
    text: '<i class="fa fa-chevron-up"></i>',
    tooltip: '모양',
    onupdate: function() {
      var btn = this;
      if( el.hc('ff-separator-dotted') ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( el.hc('ff-separator-dashed') ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( el.hc('ff-separator-zigzag') ) btn.text('<i class="fa fa-chevron-up"></i>');
      else btn.text('<i class="fa fa-minus"></i>');
    },
    fn: function(e) {
      if( el.hc('ff-separator-dotted') ) {
        el.rc('ff-separator-dotted').ac('ff-separator-dashed');
      } else if( el.hc('ff-separator-dashed') ) {
        el.rc('ff-separator-dashed').ac('ff-separator-zigzag');
      } else if( el.hc('ff-separator-zigzag') ) {
        el.rc('ff-separator-zigzag');
      } else {
        el.ac('ff-separator-dotted');
      }
    }
  })
  .add({
    text: '<i class="fa fa-arrows-h"></i>',
    tooltip: '너비',
    onupdate: function() {
      var btn = this;
      if( el.hc('ff-separator-narrow') ) btn.text('<i class="fa fa-minus"></i>');
      else btn.text('<i class="fa fa-arrows-h"></i>');
    },
    fn: function(e) {
      el.tc('ff-separator-narrow');
    }
  });
}

Separator.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      return $('<hr/>')[0];
    }
  }
});

module.exports = Separator;