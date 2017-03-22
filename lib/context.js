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

/*
function wrapnode(node, selector, start, end) {
  var asm = $.util.assemble(selector);
  var node = document.createElement(asm.tag);
  if( asm.id ) node.id = id;
  if( asm.classes ) node.className = asm.classes;
  
  $(node).find(selector).nodes().unwrap();
  node.normalize();
  
  if( node.nodeType === 3 ) {
    
    
    var origText = node.textContent, text, prevText, nextText;
    if (offsetType == 'START') {
      text = origText.substring(idx);
      prevText = origText.substring(0, idx);
    } else if (offsetType == 'END') {
      text = origText.substring(0, idx);
      nextText = origText.substring(idx);
    } else {
      text = origText;
    }
    span.textContent = text;
  
    var parent = node.parentElement;
    parent.replaceChild(span, node);
    if (prevText) { 
      var prevDOM = document.createTextNode(prevText);
      parent.insertBefore(prevDOM, span);
    }
    if (nextText) {
      var nextDOM = document.createTextNode(nextText);
      //parent.appendChild(nextDOM);
      parent.insertBefore(nextDOM, span.nextSibling);
      //parent.insertBefore(span, nextDOM);
    }
    return;
  }
  var childCount = node.childNodes.length;
  for (var i = 0; i < childCount; i++) {
    if (offsetType == 'START' && i == 0) 
      wrapnode(node.childNodes[i], 'START', idx);
    else if (offsetType == 'END' && i == childCount - 1)
      wrapnode(node.childNodes[i], 'END', idx);
    else
      wrapnode(node.childNodes[i]);
  }
}*/

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
  ranges: function(node) {
    if( !arguments.length ) return ranges;
    
    return ranges.filter(function(range) {
      return range && node.contains(range.startContainer) && node.contains(range.endContainer);
    });
  },
  range: function(node) {
    return this.ranges(node)[0];
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
  unwrap: function(range, selector) {
    if( !range || !selector ) return this;
    
    /*
    var node = range.cloneContents();
    var wrapper = $('<div/>').append(node).normalize();
    
    range.deleteContents();
    range.insertNode(wrapper[0]);
    
    wrapper.find(selector).nodes().unwrap();
    wrapper.parent(selector).nodes().unwrap();
    
    wrapper.nodes().each(function() {
      range.insertNode(this);
    });
    
    wrapper.remove();
    */
    
    var start = $(range.startContainer);
    var end = $(range.endContainer);
    
    start.find(selector).nodes().unwrap();
    start.parent(selector).nodes().unwrap();
    end.find(selector).nodes().unwrap();
    end.parent(selector).nodes().unwrap();
    
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    return this;
  },
  wrapped: function(range, selector) {
    var start = $(range.startContainer);
    var end = $(range.endContainer);
    
    return start.is(selector) || start.parent(selector).length || start.find(selector).length || end.is(selector) || end.parent(selector).length || end.find(selector).length;
  },
  toggleWrap: function(range, selector) {
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
  }
};

dispatcher.scope(context);

var ranges = [];
$(document).on('mousedown', function(e) {
  var part = context.get(e.target);
  var focused = context.focused;
  
  var isToolbar = $(e.target).parent('.ff-toolbar')[0];
  if( isToolbar ) return;
  
  if( part ) part.focus();
  else if( focused && typeof focused.blur == 'function' ) focused.blur();
})
.on('mouseup mousedown', function(e) {
  var isToolbar = $(e.target).parent('.ff-toolbar')[0];
  if( isToolbar ) return;
  
  var selection = window.getSelection();
  ranges = [];
  if( selection.rangeCount ) {
    for(var i=0; i < selection.rangeCount; i++)
      ranges.push(selection.getRangeAt(i));
  }
});

module.exports = context;



/*
getRange: function(index) {
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
}
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