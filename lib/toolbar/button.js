var $ = require('tinyselector');
var Separator = require('./separator.js');

require('./button.less');

function Button(options) {
  if( options === '-' ) return new Separator();
  if( typeof options == 'string' ) options = {text:options};
  
  var self = this;
  self.options(options);
  self.owner(options.owner);
  
  self.el = $('<div class="ff-toolbar-btn"></div>')
  .html(options.text)
  .ac(options.cls)
  .on('click', function(e) {
    e.stopPropagation();
    self.click(e);
    self.update(e);
  })[0];
}

Button.prototype = {
  options: function(options) {
    if( !arguments.length ) return this._options = this._options || {};
    this._options = options || {};
    return this;
  },
  cls: function(cls) {
    $(this.el).cc().ac('ff-toolbar-btn').ac(cls);
    return this;
  },
  active: function(b) {
    if( !arguments.length ) return $(this.el).hc('ff-toolbar-btn-active');
    $(this.el).tc('ff-toolbar-btn-active', !b);
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return !$(this.el).hc('ff-toolbar-btn-disabled');
    $(this.el).tc('ff-toolbar-btn-disabled', !b);
    return this;
  },
  owner: function(owner) {
    if( !arguments.length ) return this._owner;
    this._owner = owner;
    return this;
  },
  update: function(e) {
    var o = this.options();
    var fn = o.update;
    fn && fn.call(this, e);
    return this;
  },
  click: function(e) {
    var o = this.options();
    var fn = o.click || o.fn;
    fn && fn.call(this, e);
    return this;
  },
  text: function(text) {
    if( !arguments.length ) return this.el.innerHTML;
    this.el.innerHTML = text;
    return this;
  },
  appendTo: function(parent) {
    $(parent).append(this.el);
    return this;
  },
  remove: function() {
    $(this.el).remove();
    return this;
  }
};

module.exports = Button;