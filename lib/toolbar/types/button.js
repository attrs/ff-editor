var $ = require('tinyselector');

require('./button.less');

function Button(options) {
  if( typeof options == 'string' ) options = {text:options};
  
  this.options(options);
  this._el = $('<div class="ff-toolbar-btn"></div>')
  .ac(options.cls)
  .on('click', this);
  
  this.text(options.text);
}

Button.prototype = {
  handleEvent: function(e) {
    if( e.type == 'click' ) {
      e.stopPropagation();
      this.click(e);
      
      var toolbar = this.toolbar();
      toolbar && toolbar.update(e);
    }
  },
  options: function(options) {
    var o = this._options = this._options || options || {};
    
    if( !arguments.length ) return o;
    
    this.id = o.id;
    this._scope = o.scope || this._scope;
    this._toolbar = o.toolbar || this._toolbar;
    return this;
  },
  dom: function() {
    return this._el[0];
  },
  scope: function(scope) {
    if( !arguments.length ) return this._scope;
    this._scope = scope;
    return this;
  },
  toolbar: function(toolbar) {
    if( !arguments.length ) return this._toolbar;
    this._toolbar = toolbar;
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
  hide: function() {
    this._el.hide();
    return this;
  },
  show: function() {
    this._el.show();
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return !this._el.hc('ff-toolbar-btn-disabled');
    this._el.tc('ff-toolbar-btn-disabled', !b);
    return this;
  },
  update: function(a, b, c, d) {
    var o = this.options();
    var fn = o.onupdate;
    fn && fn.call(this.scope(), this, a, b, c, d);
    return this;
  },
  click: function(a, b, c, d) {
    var o = this.options();
    var fn = o.onclick || o.fn;
    fn && fn.call(this.scope(), this, a, b, c, d);
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