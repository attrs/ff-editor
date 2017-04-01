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
  })
  .add({
    text: '<i class="fa fa-external-link"></i>',
    tooltip: '새창으로',
    onupdate: function(btn) {
      if( el.find('a').attr('target') ) btn.active(true);
      else btn.active(false);
    },
    fn: function() {
      this.target(!this.target() ? '_blank' : null);
    }
  });
}

var proto = Link.prototype = Object.create(Part.prototype);

proto.create = function(arg) {
  var def = Link.defaultLabel;
  var href = arg && (arg.src || arg.href) || arg;
  var label = arg && (arg.name || arg.title || arg.label) || arg || def;
  
  if( !href.indexOf('data:') ) href = null;
  if( !href || typeof href !== 'string' ) href = 'javascript:;';
  if( !label || typeof label !== 'string' ) label = def;
  
  return $('<div ff-type="link"/>').append($('<a href="' + href + '" target="_blank" />').html(label))[0];
};

proto.label = function(label) {
  $(this.dom()).find('a').html(label || Link.defaultLabel);
  return this;
};

proto.target = function(target) {
  var el = $(this.dom());
  if( !arguments.length ) return el.find('a').attr('target');
  el.find('a').attr('target', target);
  return this;
};

proto.href = function(href) {
  var el = $(this.dom());
  if( !arguments.length ) return el.find('a').attr('href');
  el.find('a').attr('href', href);
  return this;
};

proto.oneditmode = function() {
  $(this.dom()).find('a').attr('contenteditable', true);
};

proto.onviewmode = function() {
  $(this.dom()).find('a').attr('contenteditable', null);
};

Link.defaultLabel = 'Link';

module.exports = Link;