var $ = require('tinyselector');
var Part = require('../../part.js');

require('./link.less');

function Link() {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-link');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-justify"></i>',
    tooltip: '정렬',
    onupdate: function(btn) {
      if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
      else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
      else if( btn.align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
      else btn.text('<i class="fa fa-align-justify"></i>');
    },
    fn: function(btn) {
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

var proto = Link.prototype = Object.create(Part.prototype);

proto.create = function(arg) {
  var def = Link.defaultLabel;
  var href = arg && (arg.src || arg.href);
  var label = arg && (arg.name || arg.title || arg.label) || def;
  
  if( typeof href !== 'string' ) href = null;
  if( typeof label !== 'string' ) label = def;
  if( !href.indexOf('data:') ) href = '';
  
  return $('<div ff-type="link"/>').append($('<a href="' + (href || 'javascript:;') + '" target="_blank"/>"').html(label))[0];
};

proto.target = function(target) {
  if( !arguments.length ) return $(this.dom()).find('a').attr('target');
  $(this.dom()).find('a').attr('target', target);
  return this;
};

proto.href = function(href) {
  if( !arguments.length ) return $(this.dom()).find('a').attr('href');
  $(this.dom()).find('a').attr('href', href);
  return this;
};

Link.defaultLabel = 'Download';

module.exports = Link;