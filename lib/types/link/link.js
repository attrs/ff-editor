var $ = require('tinyselector');
var Part = require('../../part.js');
var autoflush = require('../../autoflush.js');

require('./link.less');

function Link() {
  Part.apply(this, arguments);
}

var proto = Link.prototype = Object.create(Part.prototype);

proto.oninit = function() {
  var part = this;
  var dom = this.dom();
  var flush = autoflush(function(items) {
    part.history().save();
  }, 200);
  
  var el = $(dom).ac('f_link')
  .on('keydown', function(e) {
    if( part.editmode() && !e.metaKey && !e.ctrKey && e.target.tagName == 'A' ) flush();
  });
  
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
      
      part.history().save();
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
      part.target(!part.target() ? '_blank' : null);
    }
  });
}

proto.create = function(arg) {
  var def = Link.defaultLabel;
  var href = arg && (arg.src || arg.href) || arg;
  var label = arg && (arg.name || arg.title || arg.label) || arg || def;
  var target = arg && arg.target;
  
  if( !href.indexOf('data:') ) href = null;
  if( !href || typeof href !== 'string' ) href = 'javascript:;';
  if( !label || typeof label !== 'string' ) label = def;
  
  return $('<div ff-type="link"/>').append($('<a href="' + href + '" />').attr('target', target).html(label))[0];
};

proto.label = function(label) {
  $(this.dom()).children('a').html(label || Link.defaultLabel);
  this.history().save();
  return this;
};

proto.target = function(target) {
  var el = $(this.dom());
  if( !arguments.length ) return el.find('a').attr('target');
  el.find('a').attr('target', target);
  this.history().save();
  return this;
};

proto.href = function(href) {
  var el = $(this.dom());
  if( !arguments.length ) return el.find('a').attr('href');
  el.find('a').attr('href', href);
  this.history().save();
  return this;
};

proto.oneditmode = function() {
  $(this.dom()).children('a').attr('contenteditable', true);
};

proto.onviewmode = function() {
  $(this.dom()).children('a').attr('contenteditable', null);
};

proto.createHistory = function() {
  var part = this;
  var dom = part.dom();
  
  return (function(html, cls, css) {
    return function() {
      dom.innerHTML = html || '';
      dom.className = cls || '';
      dom.style.cssText = css || '';
      part.focus();
    };
  })(dom.innerHTML, dom.className, dom.style.cssText);
};

Link.defaultLabel = 'Link';

module.exports = Link;