var $ = require('tinyselector');
var getPosition = require('./position.js');
var Buttons = require('./buttons.js');
require('./toolbar.less');

function clone(o) {
  var result = {};
  for(var k in o) result[k] = o[k];
  return result; 
}

function Toolbar(owner, options) {
  if( !owner || typeof owner.dom !== 'function' ) throw new TypeError('illegal owner(owner.dom() requried)');
  
  this._owner = owner;
  this._el = $('<div/>').css('opacity', 0).ac('ff-toolbar').hide();
  this._buttons = new Buttons(this);
  this._enable = true;
  this.options(options);
}

Toolbar.prototype = {
  handleEvent: function(e) {
    this.update();
  },
  options: function(o) {
    if( !arguments.length ) return this._options;
    this._options = clone(o);
    return this;
  },
  position: function(position) {
    this.options().position = position;
    this.update();
    return this;
  },
  dom: function() {
    return this._el[0];
  },
  owner: function() {
    return this._owner;
  },
  buttons: function() {
    return this._buttons;
  },
  update: function() {
    var options = this.options();
    var dom = this.dom();
    var ownerElement = this.owner().dom();
    var position = options.position || 'top center outside';
    
    var el = this._el
    .css(options.style || {})
    .ac(options.cls)
    .appendTo(document.body);
    
    if( position && ownerElement ) {
      var ownerposition = getPosition(ownerElement);
      var posarr = position.split(' ');
      var inside = ~posarr.indexOf('inside');
      var vertical = ~posarr.indexOf('vertical');
      var nomargin = ~posarr.indexOf('nomargin');
      if( vertical ) el.ac('ff-toolbar-vertical');
      
      var width = ownerElement.clientWidth;
      var height = ownerElement.clientHeight;
      var tbarwidth = dom.clientWidth;
      var tbarheight = dom.clientHeight;
      var top = 0, left = 0, margin = nomargin ? 0 : (+options.margin || 10);
      
      posarr.forEach(function(pos) {
        if( !vertical ) {
          if( pos === 'top' ) {
            if( inside ) top = ownerposition.top + margin;
            else top = ownerposition.top - tbarheight - margin;
          } else if( pos == 'bottom' ) {
            if( inside ) top = ownerposition.top + height - tbarheight - margin;
            else top = ownerposition.top + height + margin;
          } else if( pos == 'left' ) {
            left = ownerposition.left;
            if( inside ) left += margin;
          } else if( pos == 'center' ) {
            left = ownerposition.left + (width - tbarwidth) / 2;
          } else if( pos == 'right' ) {
            left = ownerposition.left + width - tbarwidth;
            if( inside ) left -= margin;
          }
        } else {
          if( pos === 'top' ) {
            top = ownerposition.top;
            if( inside ) top += margin;
          } else if( pos == 'middle' ) {
            top = ownerposition.top + (height - tbarheight) / 2;
          } else if( pos == 'bottom' ) {
            top = ownerposition.top + height - tbarheight;
            if( inside ) top -= margin;
          } else if( pos == 'left' ) {
            if( inside ) left = ownerposition.left + margin;
            else left = ownerposition.left - tbarwidth - margin;
          } else if( pos == 'right' ) {
            if( inside ) left = ownerposition.left + width - tbarwidth - margin;
            else left = ownerposition.left + width + margin;
          }
        }
      });
      
      if( top <= 5 ) top = 5;
      if( left <= 5 ) left = 5;
      
      if( vertical ) {
        //if( window.scrollY + 100 > ownerElement.offsetTop ) top = window.scrollY + 100;
        if( top > ownerElement.offsetTop + height - tbarheight ) top = ownerElement.offsetTop + height - tbarheight;
      }
    
      dom.style.top = top + 'px';
      dom.style.left = left + 'px';
    }
    
    this.buttons().update();
    
    return this;
  },
  show: function() {
    if( !this.enable() ) return this;
    this._el.css('opacity', 0).show();
    this.update();
    this._el.css('opacity', 1);
    $(window).on('scroll resize', this);
    return this;
  },
  hide: function(force) {
    if( !force && this.always() ) return this;
    $(window).off('scroll resize', this);
    this._el.css('opacity', 0).hide();
    return this;
  },
  refresh: function() {
    this.update();
    return this;
  },
  always: function(b) {
    if( !arguments.length ) return this._always;
    this._always = !!b;
    this.update();
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return this._enable;
    this._enable = !!b;
    this.update();
    return this;
  },
  add: function(btn, index) {
    this.buttons().add(btn, index);
    return this;
  },
  first: function(btn) {
    this.buttons().first(btn);
    return this;
  },
  last: function(btn) {
    this.buttons().last(btn);
    return this;
  },
  clear: function(btn) {
    this.buttons().clear();
    return this;
  },
  remove: function(btn) {
    this.buttons().remove(btn);
    return this;
  }
};


module.exports = Toolbar;
