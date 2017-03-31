var Types = require('./types.js');
var Toolbar = require('./toolbar/');
var $ = require('tinyselector');
var context = require('./context.js');

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
        if( !~['on', 'once'].indexOf(name) && name.startsWith('on') )
          self.on('ff-' + name.substring(2), self[name]);
      });
    });
  })();
  
  if( dom !== arg ) self.removable(true);
  
  var toolbarposition = el.attr('ff-toolbar');
  if( toolbarposition === 'false' ) self.toolbar().enable(false);
  else if( toolbarposition ) self.toolbar().position(toolbarposition);
  
  self.fire('ff-init');
  if( context.editmode() ) self.editmode(true);
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
    var toolbar = this.toolbar();
    var removebtn = toolbar.get('remove');
    if( !arguments.length ) return removebtn ? true : false;
    
    if( !removable ) toolbar.remove('remove');
    
    if( !removebtn ) toolbar.last({
      id: 'remove',
      text: '<i class="fa fa-remove"></i>',
      fn: function(e) {
        this.remove();
      }
    });
    
    return this;
  },
  dom: function() {
    return this._n;
  },
  create: function(arg) {
    return $('<div/>').html(arg)[0];
  },
  html: function(html) {
    var dom = this.dom();
    if( !arguments.length ) {
      var editmode = this.editmode();
      this.editmode(false);
      var html = dom.innerHTML;
      this.editmode(editmode);
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
    return this;
  },
  remove: function() {
    this.blur();
    this.toolbar().hide();
    this.fire('ff-remove');
    $(this.dom()).remove();
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) return !!this._md;
    var prev = this._md;
    var editmode = this._md = !!b;
  
    if( editmode !== prev ) this.fire('ff-modechange', {editmode: editmode});
    return this;
  },
  data: function(data) {
    if( !arguments.length ) {
      if( this.getData ) return this.getData();
      return this._d || null;
    }
    
    if( this.setData ) this.setData(data);
    else this._d = data;
    
    this.fire('ff-data', {old: this._d, data: data});
    return this;
  },
  fire: function(type, detail, cancellable, bubble) {
    return !!$(this.dom()).fire(type, detail, cancellable, bubble)[0];
  },
  on: function(type, fn) {
    var self = this;
    fn._wrapper = function() {
      return fn.apply(self, arguments);
    };
    
    $(this.dom()).on(type, fn._wrapper);
    return this;
  },
  once: function(type, fn) {
    var self = this;
    fn._wrapper = function() {
      return fn.apply(self, arguments);
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
    if( this.editmode() && this !== context.focused ) {
      if( context.focused && typeof context.focused.blur == 'function' ) context.focused.blur();
      $(this.dom()).ac('ff-focus-state');
      this.fire('ff-focus');
      context.focused = this;
    }
    return this;
  },
  blur: function() {
    if( this.editmode() && this === context.focused ) {
      $(this.dom()).rc('ff-focus-state');
      this.fire('ff-blur');
      context.focused = null;
    }
    return this;
  },
  ranges: function(collapsed) {
    return context.ranges(this.dom(), collapsed);
  },
  range: function(collapsed) {
    return context.range(this.dom(), collapsed);
  }
};

module.exports = Part;