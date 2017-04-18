var $ = require('tinyselector');
var Buttons = require('./buttons.js');
var doc = document;
var win = window;

require('./toolbar.less');

function clone(o) {
  var result = {};
  for(var k in o) result[k] = o[k];
  return result; 
}

function Toolbar(scope, options) {
  this._el = $('<div/>').ac('ff-toolbar ff-acc');
  this._buttons = new Buttons(this);
  this.options(options);
  this.scope(scope);
  
  this._el[0].toolbar = this;
}

Toolbar.DEFAULT_GAP = 10;
Toolbar.DEFAULT_LIMIT_Y = 15;

Toolbar.prototype = {
  dom: function() {
    return this._el[0];
  },
  scope: function(scope) {
    if( !arguments.length ) return this._scope || this;
    this._scope = scope;
    if( scope && scope.dom && scope.dom() ) this.tracker(scope.dom());
    return this;
  },
  options: function(o) {
    if( !arguments.length ) return this._options;
    o = this._options = clone(o);
    
    this.enable(o.enable === false ? false : true);
    this.always(o.always === true ? true : false);
    this.tracker(o.tracker);
    this.position(o.position);
    
    var dom = this.dom();
    if( o.cls ) dom.className = o.cls;
    if( o.style ) dom.style = o.style;
    
    return this;
  },
  gap: function(gap) {
    if( !arguments.length ) return this._gap || Toolbar.DEFAULT_GAP;
    this._gap = +gap;
    this.update();
    return this;
  },
  tracker: function(tracker) {
    if( !arguments.length ) return this._tracker;
    this._tracker = tracker;
    this.update();
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return this._enable;
    this._enable = !!b;
    this.update();
    return this;
  },
  always: function(b) {
    if( !arguments.length ) return this._always;
    this._always = !!b;
    this.update();
    return this;
  },
  position: function(position) {
    if( !arguments.length ) return this._position || 'top center outside';
    this._position = position;
    this.update();
    return this;
  },
  buttons: function() {
    return this._buttons;
  },
  add: function(btn, index) {
    this.buttons().add(btn, index);
    return this;
  },
  get: function(id) {
    return this.buttons().get(id);
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
  },
  handleEvent: function(e) {
    this.update();
  },
  show: function(b) {
    if( !this.enable() ) return this;
    
    var tracker = this.tracker();
    var offsetparent = tracker.offsetParent || doc.body;
    if( offsetparent ) $(this.dom()).appendTo(offsetparent).css('opacity', 1);
    this.update();
    return this;
  },
  hide: function(force) {
    if( !force && this.always() ) return this;
    
    $(this.dom()).css('opacity', null).remove();
    return this;
  },
  update: function() {
    var tracker = this.tracker();
    if( !tracker ) return this;
    
    var dom = this.dom();
    var el = $(dom);
    var enable = this.enable();
    var offsetparent = tracker.offsetParent || doc.body;
    
    $(win).off('scroll resize wheel', this);
    
    if( !enable || !offsetparent || !offsetparent.contains(dom) || !offsetparent.contains(tracker) ) {
      el.remove();
      return this;
    }
    
    if( !tracker ) return this;
    
    var scope = this.scope();
    var position = this.position();
    var gap = this.gap();
    var limitY = Toolbar.DEFAULT_LIMIT_Y;
    var scopeposition = $(tracker).position();
    var posarr = position.split(' ');
    var inside = ~posarr.indexOf('inside');
    var vertical = ~posarr.indexOf('vertical');
    var nomargin = ~posarr.indexOf('nomargin');
    if( vertical ) el.ac('ff-toolbar-vertical');
    
    var width = tracker.clientWidth;
    var height = tracker.clientHeight;
    var tbarwidth = dom.clientWidth;
    var tbarheight = dom.clientHeight;
    var top = 0, left = 0, margin = nomargin ? 0 : gap;
    
    posarr.forEach(function(pos) {
      if( vertical ) {
        if( pos === 'top' ) {
          top = scopeposition.top;
          if( inside ) top += margin;
        } else if( pos == 'middle' ) {
          top = scopeposition.top + (height - tbarheight) / 2;
        } else if( pos == 'bottom' ) {
          top = scopeposition.top + height - tbarheight;
          if( inside ) top -= margin;
        } else if( pos == 'left' ) {
          if( inside ) left = scopeposition.left + margin;
          else left = scopeposition.left - tbarwidth - margin;
        } else if( pos == 'right' ) {
          if( inside ) left = scopeposition.left + width - tbarwidth - margin;
          else left = scopeposition.left + width + margin;
        }
        
      } else {
        if( pos === 'top' ) {
          if( inside ) top = scopeposition.top + margin;
          else top = scopeposition.top - tbarheight - margin;
        } else if( pos == 'bottom' ) {
          if( inside ) top = scopeposition.top + height - tbarheight - margin;
          else top = scopeposition.top + height + margin;
        } else if( pos == 'left' ) {
          left = scopeposition.left;
          if( inside ) left += margin;
        } else if( pos == 'center' ) {
          left = scopeposition.left + (width - tbarwidth) / 2;
        } else if( pos == 'right' ) {
          left = scopeposition.left + width - tbarwidth;
          if( inside ) left -= margin;
        }
      }
    });
    
    if( offsetparent === doc.body ) {
      if( top <= 5 ) top = 5;
      if( left <= 5 ) left = 5;
    }
    
    if( vertical ) {
      //console.log('vertical', scopeposition, top);
      var scrolltop = (offsetparent && offsetparent.scrollTop) ? offsetparent.scrollTop : doc.body.scrollTop;
      
      if( scrolltop + limitY > scopeposition.top ) top = scrolltop + limitY;
      if( top > scopeposition.top + height - tbarheight ) top = scopeposition.top + height - tbarheight;
    }
    
    dom.style.top = top + 'px';
    dom.style.left = left + 'px';
    $(win).on('scroll resize wheel', this);
    
    this.buttons().update();
    return this;
  }
};


module.exports = Toolbar;
