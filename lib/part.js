var Types = require('./types.js');
var Toolbar = require('./toolbar/');
var $ = require('tinyselector');
var context = require('./context.js');
var Items = require('./items.js');

function Part(arg) {
  var dom = arg;
  if( dom && dom._ff ) return dom._ff;
  if( !(this instanceof Part) ) return null;
  
  if( !dom || !$.util.isElement(dom) ) dom = this.create.apply(this, arguments);
  if( !$.util.isElement(dom) ) throw new TypeError('illegal arguments: dom');
  
  var self = dom._ff = this;
  var el = $(self._n = dom).ac('ff')
  .on('ff-focus ff-blur ff-modechange mouseenter mouseleave mouseup mousedown dragstart dragend', self);
  
  // regist event in prototypes
  (function() {
    var o = self, prototypes = [];
    do {
      if( o === Part.prototype ) break;
      prototypes.push(o);
    } while(o = Object.getPrototypeOf(o));
    
    prototypes.reverse().forEach(function(o) {
      Object.getOwnPropertyNames(o).forEach(function(name) {
        if( !~['on', 'once'].indexOf(name) && !name.indexOf('on') )
          self.on('ff-' + name.substring(2), self[name]);
      });
    });
  })();
  
  if( dom !== arg ) self.removable(true);
  
  var toolbar = self.toolbar();
  Part.toolbar.forEach(function(item) {
    toolbar.last(item);
  });
  
  var toolbarposition = el.attr('ff-toolbar');
  if( toolbarposition === 'true' ) toolbarposition = null;
  if( toolbarposition === 'false' ) toolbar.enable(false);
  else if( toolbarposition ) toolbar.position(toolbarposition);
  
  self.fire('ff-init');
  if( context.editmode() ) self.editmode(true);
  context.fire('ff-detect', {part:self});
  
  self.history().init();
}

Part.prototype = {
  handleEvent: function(e) {
    if( e.defaultPrevented ) return;
    
    var type = e.type;
    var self = this;
    var editmode = self.editmode();
    var toolbar = self.toolbar();
    var target = e.target || e.srcElement;
    var dom = self.dom();
    var el = $(dom);
    
    if( type == 'ff-data' ) {
      self.fire('ff-render', {
        type: 'data',
        originalEvent: e
      });
    } else if( type == 'ff-modechange' ) {
      if( editmode ) {
        if( toolbar.always() ) toolbar.show();
        el.ac('ff-edit-state');
        self.fire('ff-editmode');
      } else {
        toolbar.hide(true);
        el.rc('ff-edit-state').rc('ff-focus-state').rc('ff-enter-state').rc('ff-dragging');
        self.fire('ff-viewmode');
        self.blur();
      }
      
      self.fire('ff-render', {
        type: 'modechange',
        originalEvent: e
      });
    } 
    
    if( editmode ) {
      if( type == 'ff-focus' ) {
        el.attr('draggable', true);
        toolbar.show();
      } else if( type == 'ff-blur' ) {
        el.attr('draggable', null);
        toolbar.hide();
      } else if( type == 'mouseenter' ) {
        toolbar.update();
        el.ac('ff-enter-state');
      } else if( ~['mousedown', 'mouseup'].indexOf(type) ) {
        setTimeout(function() {
          toolbar.update();
        }, 0);
      } else if( type == 'mouseleave' ) {
        el.rc('ff-enter-state');
      } else if( type == 'dragstart' ) {
        if( target === dom ) {
          toolbar.hide();
          context.dragging = dom;
          e.dataTransfer.setDragImage(el[0], 0, 0);
          e.dataTransfer.setData('text', target.outerHTML);
          el.ac('ff-dragging');
          self.history().init();
        }
      } else if( type == 'dragend' ) {
        if( target === dom ) {
          toolbar.show();
          context.dragging = null;
          el.rc('ff-dragging');
        }
      }
    }
  },
  context: function() {
    return context;
  },
  createToolbar: function() {
    return new Toolbar(this);
  },
  toolbar: function() {
    return this._t || (this._t = this.createToolbar());
  },
  removable: function(removable) {
    if( !arguments.length ) return this._rm;
    this._rm = !!removable;
    return this;
  },
  dom: function() {
    return this._n;
  },
  create: function(arg) {
    return $('<div/>').html(arg)[0];
  },
  html: function(html) {
    var part = this;
    var dom = part.dom();
    if( !arguments.length ) {
      var editmode = part.editmode();
      part.editmode(false);
      var html = dom.innerHTML;
      part.editmode(editmode);
      var tmp = $('<div/>').html(html);
      tmp
      .find('.ff, .ff-edit-state, .ff-enter-state, .ff-focus-state, .ff-dragging, [draggable], [contenteditable]')
      .rc('ff ff-edit-state ff-enter-state ff-focus-state ff-dragging')
      .attr('draggable', null)
      .attr('contenteditable', null);
      
      tmp.find('.ff-acc').remove();
      
      return tmp.html();
    }
    
    dom.innerHTML = html || '';
    part.history().init();
    return part;
  },
  parent: function() {
    var p = this.dom().parentNode;
    return p && context.partof(p);
  },
  parents: function() {
    var p = this.dom().parentNode;
    return p && context.partsof(p);
  },
  remove: function() {
    var part = this;
    part.blur();
    part.toolbar().hide();
    part.fire('ff-remove');
    $(part.dom()).remove();
    return part;
  },
  editmode: function(b) {
    var part = this;
    if( !arguments.length ) return !!part._md;
    var prev = part._md;
    var editmode = part._md = !!b;
  
    if( editmode !== prev ) part.fire('ff-modechange', {editmode: editmode});
    return part;
  },
  data: function(data) {
    var part = this;
    if( !arguments.length ) {
      if( part.getData ) return part.getData();
      return part._d || null;
    }
    
    if( part.setData ) part.setData(data);
    else part._d = data;
    
    part.fire('ff-data', {old: part._d, data: data});
    part.history().init();
    return part;
  },
  fire: function(type, detail, cancellable, bubble) {
    return !!$(this.dom()).fire(type, detail, cancellable, bubble)[0];
  },
  on: function(type, fn) {
    var part = this;
    fn._wrapper = function() {
      return fn.apply(part, arguments);
    };
    
    $(this.dom()).on(type, fn._wrapper);
    return this;
  },
  once: function(type, fn) {
    var part = this;
    fn._wrapper = function() {
      return fn.apply(part, arguments);
    };
    
    $(this.dom()).once(type, fn._wrapper);
    return this;
  },
  off: function(type, fn) {
    $(this.dom()).off(type, fn._wrapper || fn);
    return this;
  },
  clear: function() {
    this.data(null).fire('ff-clear');
    return this;
  },
  click: function() {
    this.dom().click();
    return this;
  },
  focus: function() {
    var part = this;
    var dom = part.dom();
    
    if( part.editmode() && part !== context.focused && document.body.contains(dom) ) {
      if( context.focused && typeof context.focused.blur == 'function' ) context.focused.blur();
      $(dom).ac('ff-focus-state');
      part.fire('ff-focus');
      context.focused = part;
    }
    
    return part;
  },
  blur: function() {
    var part = this;
    if( part.editmode() && part === context.focused ) {
      $(part.dom()).rc('ff-focus-state');
      part.fire('ff-blur');
      context.focused = null;
    }
    return part;
  },
  ranges: function(collapsed) {
    return context.ranges(this.dom(), collapsed);
  },
  range: function(collapsed) {
    return context.range(this.dom(), collapsed);
  },
  
  // history
  createHistory: function() {
    var part = this;
    var dom = part.dom();
    
    return (function(cls, css) {
      return function() {
        dom.className = cls || '';
        dom.style.cssText = css || '';
        part.focus();
      };
    })(dom.className, dom.style.cssText);
  },
  history: function() {
    var part = this;
    var history = context.history();
    var def;
    
    return part._history = part._history || {
      init: function(b) {
        if( b === false ) {
          def = null;
          return this;
        }
        
        if( typeof b == 'function' ) def = b;
        else def = part.createHistory();
        
        return this;
      },
      save: function(fn) {
        if( typeof fn != 'function' ) fn = null;
        
        if( def ) history.add(def), def = null;
        history.add(fn || part.createHistory());
        
        return this;
      }
    };
  }
};

Part.toolbar = new Items()
.add({
  id: 'clearfix',
  text: '<i class="fa fa-asterisk"></i>',
  tooltip: '클리어픽스',
  onupdate: function(btn) {
    btn.active($(this.dom()).hc('f_clearfix'));
  },
  fn: function() {
    $(this.dom()).tc('f_clearfix');
    this.history().save();
  }
})
.add({
  id: 'remove',
  text: '<i class="fa fa-remove"></i>',
  onupdate: function(btn) {
    if( this.removable() ) btn.show();
    else btn.hide();
  },
  fn: function() {
    this.remove();
  }
});

module.exports = Part;