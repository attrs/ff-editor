var async = require('async');
var Events = require('tinyevent');
var $ = require('tinyselector');
var types = require('./types.js');
var connector = require('./connector/');

var parts = [];
var data = {};
var editmode = false;
var dispatcher = Events();

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
    [].slice.call(document.querySelectorAll('[ff-id], [ff-type]')).reverse().forEach(function(el) {
      var id = el.getAttribute('ff-id');
      var type = el.getAttribute('ff-type') || 'default';
      var part = el.__ff__;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[firefront] not found type: ' + type);
        part = el.__ff__ = new Type(el);
        data[id] && part.data(data[id]);
      }
      
      parts.push(part);
      if( id ) parts[id] = part;
    });
  },
  reset: function(d) {
    if( !arguments.length ) d = data;
    
    data = d;
    this.scan();
    parts.forEach(function(part) {
      data[part.id] && part.data(data[part.id]);
    });
    
    dispatcher.fire('reset');
    
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
  }
};

context.isElement = function(node) {
  return (
    typeof HTMLElement === 'object' ? node instanceof HTMLElement : node && typeof node === 'object' && node !== null && node.nodeType === 1 && typeof node.nodeName === 'string'
  );
};

context.upload = function(file, done) {
  var reader = new FileReader(); // NOTE: IE10+
  reader.onload = function(e) {
    done(null, e.target.result);
  };
  reader.onerror = function(err) {
    done(err);
  };
  reader.readAsDataURL(file);
  
  return this;
};

context.selectFile = function(options, done) {
  if( arguments.length === 1 ) done = options, options = null;
  
  var input = document.createElement('input');
  input.type = 'file';
  if( options && options.multiple ) input.setAttribute('multiple', 'true');
  input.click();
  input.onchange = function() {
    var srcs = [];
    async.eachSeries(input.files, function(file, done) {
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
};

context.getRange = function(index) {
  if( !window.getSelection ) return null;
  
  var selection = window.getSelection();
  if( selection.rangeCount && selection.rangeCount > (index || 0) ) return selection.getRangeAt(index || 0);
  return null;
};

context.setRange = function(range) {
  if( !window.getSelection ) return;
  
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

context.getCaretPosition = function(node) {
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
  
  return caretPos;
};

context.getPart = function(node) {
  var node = $(node).parent(function() {
    if( this.__ff__ ) return this;
  }, true)[0];
  return node && node.__ff__;
};

dispatcher.scope(context);

module.exports = context;