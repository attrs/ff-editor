var each = require('async-each-series');
var Events = require('tinyevent');
var $ = require('tinyselector');
var types = require('./types.js');
var connector = require('./connector/');

var parts = [];
var data = {};
var editmode = false;
var dispatcher = Events();
var uploader;

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
      var id = el.getAttribute('ff-id') || el.id;
      var type = el.getAttribute('ff-type') || 'default';
      var part = el.__ff__;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[firefront] not found type: ' + type);
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
      part.data(data && data[part.id]);
    });
    
    dispatcher.fire('reset');
    
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
    
    dispatcher.fire('editmode', {
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
  isElement: function(node) {
    return (
      typeof HTMLElement === 'object' ? node instanceof HTMLElement : node && typeof node === 'object' && node !== null && node.nodeType === 1 && typeof node.nodeName === 'string'
    );
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
    var input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('multiple', 'true');
    input.click();
    input.onchange = function() {
      var srcs = [];
      each([].slice.call(input.files), function(file, done) {
        context.upload(file, function(err, src) {
          if( err ) return done(err);
          srcs.push(src);
          done();
        });
      }, function(err) {
        if( err ) return done(err);
        done(null, srcs);
      });
    };
  
    return this;
  },
  selectFile: function(done) {
    var input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.onchange = function() {
      context.upload(input.files[0], done);
    };
  
    return this;
  },
  getPart: function(node) {
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
  wrap: function(range, selector) {
    range.surroundContents(node);
    return this;
  },
  unwrap: function(range, selector) {
    console.log('unwrap', range);
    return this;
  },
  wrapped: function(range, selector) {
    return false;
  },
  toggleWrap: function(range, selector) {
    if( this.wrapped(range, selector) ) this.unwrap(range, selector);
    else this.wrap(range, selector);
    return this;
  }
  /*getRange: function(index) {
    if( !window.getSelection ) return null;
    
    var selection = window.getSelection();
    if( selection.rangeCount && selection.rangeCount > (index || 0) ) return selection.getRangeAt(index || 0);
    return null;
  },
  setRange: function(range) {
    if( !range || !window.getSelection ) return this;
    
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    return this;
  }*/
};

dispatcher.scope(context);

$(document).on('mousedown', function(e) {
  var part = context.getPart(e.target);
  var focused = context.focused;
  
  var isToolbar = $(e.target).parent('.ff-toolbar')[0];
  if( isToolbar ) return;
  
  if( part ) part.focus();
  else if( focused && typeof focused.blur == 'function' ) focused.blur();
});

module.exports = context;




/*

getCaretPosition: function(node) {
  if( !window.getSelection ) return -1;
  if( !node ) return -1;

  var position = -1;
  var selection = window.getSelection();

  if( selection.rangeCount ) {
    var range = selection.getRangeAt(0);
    if( range.commonAncestorContainer.parentNode == node ) {
      position = range.endOffset;
    }
  }

  return position;
},*/