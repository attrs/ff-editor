var $ = require('tinyselector');

require('./button.less');

function Button(options) {
  if( typeof options == 'string' ) options = {text:options};
  
  var self = this;
  self.options(options);
  self.owner(options.owner);
  
  self._el = $('<div class="ff-toolbar-btn"></div>')
  .ac(options.cls)
  .on('click', this);
  
  this.text(options.text);
}

Button.prototype = {
  handleEvent: function(e) {
    if( e.type == 'click' ) {
      e.stopPropagation();
      this.click(e);
      this.update(e);
    }
  },
  options: function(options) {
    if( !arguments.length ) return this._options = this._options || {};
    this._options = options || {};
    this.id = this._options.id;
    return this;
  },
  dom: function() {
    return this._el[0];
  },
  owner: function(owner) {
    if( !arguments.length ) return this._owner;
    this._owner = owner;
    return this;
  },
  cls: function(cls) {
    this._el.cc().ac('ff-toolbar-btn').ac(cls);
    return this;
  },
  active: function(b) {
    if( !arguments.length ) return this._el.hc('ff-toolbar-btn-active');
    this._el.tc('ff-toolbar-btn-active', b);
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return !this._el.hc('ff-toolbar-btn-disabled');
    this._el.tc('ff-toolbar-btn-disabled', !b);
    return this;
  },
  update: function(e) {
    var o = this.options();
    var fn = o.onupdate;
    fn && fn.call(this, e);
    return this;
  },
  click: function(e) {
    var o = this.options();
    var fn = o.onclick || o.fn;
    fn && fn.call(this, e);
    return this;
  },
  text: function(text) {
    if( !arguments.length ) return this._el.html();
    this._el.html(text);
    return this;
  },
  appendTo: function(parent, index) {
    $(parent).append(this._el[0], index);
    return this;
  },
  remove: function() {
    this._el.remove();
    return this;
  }
};

module.exports = Button;