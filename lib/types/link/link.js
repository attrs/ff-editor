var $ = require('tinyselector');
var Part = require('../../part.js');
var autoflush = require('../../autoflush.js');
var tools = require('../../tools.js');
var Items = require('../../items.js');

require('./link.less');

function Link() {
  Part.apply(this, arguments);
}

var proto = Link.prototype = Object.create(Part.prototype);
var items = Link.toolbar = new Items([
  tools.align,
  tools.target
]);

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
  .add(items);
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