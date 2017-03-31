var Events = require('tinyevent');
var $ = require('tinyselector');
var EditHistory = require('./history.js');
var types = require('./types.js');
var Items = require('./items.js');
var connector = require('./connector/');

var parts = [];
var data = {};
var editmode = false;
var dispatcher = Events();
var uploader;
var fonts = new Items();
var colors = new Items();

function nextnode(node, skip){
  if( node.firstChild && !skip ) return node.firstChild;
  if( !node.parentNode ) return null;
  
  return node.nextSibling || nextnode(node.parentNode, true);
}

function rangelist(range){
  var start = range.startContainer.childNodes[range.startOffset] || range.startContainer;
  var end = range.endContainer.childNodes[range.endOffset] || range.endContainer;
  
  if( start === end ) return [start];
  
  var nodes = [], current = start;
  do {
    nodes.push(current);
  } while ((current = nextnode(current)) && (current != end));
  
  return nodes;
}

var context = {
  connector: function() {
    return connector;
  },
  types: function() {
    return types;
  },
  parts: function() {
    return parts.slice();
  },
  part: function(id) {
    return parts[id];
  },
  clear: function(id) {
    parts.forEach(function(part) {
      part.data(null);
    });
    return this;
  },
  scan: function() {
    [].slice.call(document.querySelectorAll('[ff], [ff-type]')).reverse().forEach(function(el) {
      var id = el.getAttribute('ff-id');
      var type = el.getAttribute('ff-type') || el.getAttribute('ff') || 'default';
      var part = el.__ff__;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[ff] not found type: ' + type);
        part = el.__ff__ = new Type(el);
      }
      
      if( !~parts.indexOf(part) ) {
        parts.push(part);
        if( id ) part.id = id, parts[id] = part;
      }
    });
  },
  reset: function(d) {
    if( !arguments.length ) d = data;
    
    data = d;
    this.scan();
    
    parts.forEach(function(part) {
      if( part.id ) part.data(data && data[part.id]);
    });
    
    dispatcher.fire('reset', {data:data});
    return this;
  },
  data: function(data) {
    if( !arguments.length ) {
      data = {};
      parts.forEach(function(part) {
        if( part.id ) data[part.id] = part.data();
      });
      
      return data;
    }
    
    this.reset(data);
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) return editmode;
    
    editmode = !!b;
    parts.forEach(function(part) {
      part.editmode(!!b);
    });
    
    dispatcher.fire('modechange', {
      editmode: editmode
    });
    
    return this;
  },
  on: function(type, fn) {
    dispatcher.on(type, fn);
    return this;
  },
  once: function(type, fn) {
    dispatcher.once(type, fn);
    return this;
  },
  off: function(type, fn) {
    dispatcher.off(type, fn);
    return this;
  },
  fire: function() {
    return dispatcher.fire.apply(dispatcher, arguments);
  },
  uploader: function(fn) {
    if( !fn || typeof fn !== 'function' ) throw new TypeError('uploader must be a function');
    uploader = fn;
    return this;
  },
  upload: function(file, done) {
    if( uploader ) {
      uploader.apply(this, arguments);
      return this;
    }
  
    if( !window.FileReader ) return done(new Error('not found FileReader'));
    var reader = new FileReader(); // NOTE: IE10+
    reader.onload = function(e) {
      done(null, {
        src: e.target.result,
        name: file.name
      });
    };
    reader.onerror = function(err) {
      done(err);
    };
    reader.readAsDataURL(file);
  
    return this;
  },
  selectFiles: function(done) {
    $('<input type="file" multiple>').on('change', function() {
      var srcs = [];
      $(this.files).async(function(file, done) {
        context.upload(file, function(err, src) {
          if( err ) return done(err);
          srcs.push(src);
          done();
        });
      }, function(err) {
        if( err ) return done(err);
        done(null, srcs);
      });
    }).click();
  
    return this;
  },
  selectFile: function(done) {
    $('<input type="file">').on('change', function() {
      context.upload(this.files[0], done);
    }).click();
    
    return this;
  },
  get: function(node) {
    var node = $(node).parent(function() {
      return this.__ff__;
    }, true)[0];
    return node && node.__ff__;
  },
  type: function(name, cls) {
    if( arguments.length <= 1 ) return types.get(name);
    types.define(name, cls);
    return this;
  },
  
  // range
  ranges: function(node, collapsed) {
    var selection = window.getSelection();
    var ranges = [];
    if( selection.rangeCount ) {
      for(var i=0; i < selection.rangeCount; i++)
        ranges.push(selection.getRangeAt(i));
    }
    
    if( !arguments.length ) return ranges;
    
    return ranges.filter(function(range) {
      if( !collapsed && range.collapsed ) return;
      return range && node.contains(range.startContainer) && node.contains(range.endContainer);
    });
  },
  range: function(node, collapsed) {
    var ranges = this.ranges(node, collapsed);
    return ranges && ranges.length && ranges[ranges.length - 1];
  },
  unwrap: function(range, selector) {
    if( !range || !selector ) return this;
    
    var common = $(range.commonAncestorContainer);
    var node = range.cloneContents();
    var tmp = $('<div/>').append(node);
    
    //console.log('tmp', tmp.html());
    tmp.nodes().each(function() {
      var el = $(this);
      
      el.find(selector).nodes().unwrap();
      if( el.is(selector) ) el.nodes().unwrap();
    });
    
    var nodes = tmp.normalize().nodes();
    //console.log('nodes', tmp.html());
    if( !nodes.length ) return this;
    
    var start = nodes[0];
    var end = nodes[nodes.length - 1];
    
    range.deleteContents();
    
    nodes.reverse().each(function() {
      range.insertNode(this);
    });
    
    range = document.createRange();
    range.selectNodeContents(start);
    var startoffset = range.startOffset;
    
    range = document.createRange();
    range.selectNodeContents(end);
    var endoffset = range.endOffset;
    
    range = document.createRange();
    range.setStart(start, startoffset);
    range.setEnd(end, endoffset);
    
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    start.parentNode.normalize();
    
    return this;
  },
  wrap: function(range, selector) {
    if( !range ) return null;
    if( typeof selector != 'string' || !selector ) selector = 'div';
    
    var node = range.cloneContents();
    var asm = $.util.assemble(selector);
    var wrapper = document.createElement(asm.tag);
    if( asm.id ) wrapper.id = id;
    if( asm.classes ) wrapper.className = asm.classes;
    
    wrapper.appendChild(node);
    wrapper.normalize();
    range.deleteContents();
    range.insertNode(wrapper);
    
    // select new node
    var range = document.createRange();
    range.selectNodeContents(wrapper);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    return wrapper;
  },
  wrapped: function(range, selector) {
    if( !range ) return false;
    
    var wrapped = false;
    $(rangelist(range)).each(function() {
      if( wrapped ) return false;
      var el = $(this);
      wrapped = el.is(selector) || el.parent(selector).length || el.find(selector).length;
    });
    
    return wrapped;
  },
  toggleWrap: function(range, selector) {
    if( !range ) return this;
    if( this.wrapped(range, selector) ) this.unwrap(range, selector);
    else this.wrap(range, selector);
    return this;
  },
  
  // alert
  prompt: function(message, callback, options) {
    if( dispatcher.fire('prompt', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this, prompt(message));
    }
    
    return this;
  },
  confirm: function(message, callback, options) {
    if( dispatcher.fire('prompt', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this, confirm(message));
    }
    
    return this;
  },
  alert: function(message, callback, options) {
    if( dispatcher.fire('alert', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this);
      alert(message);
    }
    
    return this;
  },
  error: function(error, callback, options) {
    if( typeof error == 'string' ) error = new Error(error);
    
    if( dispatcher.fire('error', {
      error: error,
      message: error.message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this);
      console.error(error);
      alert(error.message);
    }
    
    return this;
  },
  fonts: function(arr) {
    if( !arguments.length ) return fonts;
    fonts = new Items(arr);
    return this;
  },
  colors: function(arr) {
    if( !arguments.length ) return colors;
    colors = new Items(arr);
    return this;
  },
  
  // history
  history: function() {
    return this._history = this._history || new EditHistory(this);
  }
};

dispatcher.scope(context);

(function() {
  var platform = window.navigator.platform;
  var mac = !!~platform.toLowerCase().indexOf('mac');
  
  $(document).on('mousedown', function(e) {
    var target = e.target || e.srcElement;
    var part = context.get(target);
    
    if( !part ) return;
    
    var focused = context.focused;
    if( part ) part.focus();
    else if( focused && typeof focused.blur == 'function' ) focused.blur();
  })
  .on('keydown', function(e) {
    if( mac ) {
      if( e.metaKey && e.key == 'z' ) context.history().undo();
      else if( e.metaKey && e.shiftKey && e.key == 'Z' ) context.history().redo();
    } else {
      if( e.ctrlKey && e.key == 'z' ) context.history().undo();
      else if( e.ctrlKey && e.key == 'y' ) context.history().redo();
    }
  })
  .on('selectionchange', function(e) {
    //console.log('Selection changed.', e); 
  });
})();

module.exports = context;
