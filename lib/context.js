var $ = require('tinyselector');
var EditHistory = require('./history.js');
var types = require('./types.js');
var Items = require('./items.js');

var win = window,
    doc = document,
    editmode = false,
    data = {},
    uploader,
    fonts = new Items(),
    colors = new Items(),
    history = new EditHistory(this);

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
  scan: function(fn, all) {
    context.parts.apply(context, arguments);
    return context;
  },
  parts: function(fn, all) {
    if( fn === true ) all = fn;
    
    return $(all ? '.ff' : '[ff-id], [ff], [ff-type]').reverse().each(function(i, el) {
      var id = el.getAttribute('ff-id');
      var type = el.getAttribute('ff-type') || el.getAttribute('ff') || 'default';
      var part = el._ff;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[ff] not found type: ' + type);
        part = el._ff = new Type(el);
        id && part.data(data[id]);
      }
      
      part.id = id;
      typeof fn == 'function' && fn.call(context, part);
    }).slice();
  },
  data: function(newdata) {
    if( !arguments.length ) {
      newdata = {};
      context.parts(function(part) {
        if( part.id ) newdata[part.id] = part.data();
      });
      return newdata;
    }
    
    data = newdata || {};
    context.parts(function(part) {
      part.id && part.data(data[part.id]);
    });
    
    context.fire('ff-data', {
      data: newdata
    });
    
    return context;
  },
  part: function(id) {
    var el = $('[ff-id="' + id + '"]');
    return el[0] && el[0]._ff;
  },
  partof: function(node) {
    var found = $(node).parent(function() {
      return this._ff;
    }, true)[0];
    return found && found._ff;
  },
  editmode: function(b) {
    if( !arguments.length ) return editmode;
    if( editmode === !!b ) return context;
    
    editmode = !!b;
    
    context.parts(function(part) {
      part.editmode(editmode);
    }, true);
    
    context.fire('ff-modechange', {
      editmode: editmode
    });
    
    return context;
  },
  
  // event
  fire: function(type, detail, cancellable, bubble) {
    return !!$(doc).fire(type, detail, cancellable, bubble)[0];
  },
  on: function(type, fn) {
    fn._wrapper = function() {
      return fn.apply(context, arguments);
    };
    
    $(doc).on(type, fn._wrapper);
    return this;
  },
  once: function(type, fn) {
    fn._wrapper = function() {
      return fn.apply(context, arguments);
    };
    
    $(doc).once(type, fn._wrapper);
    return this;
  },
  off: function(type, fn) {
    $(doc).off(type, fn._wrapper || fn);
    return this;
  },
  
  // part type
  types: function() {
    return types;
  },
  type: function(name, cls) {
    if( arguments.length <= 1 ) return types.get(name);
    types.define(name, cls);
    
    return context;
  },
  
  // uploader
  uploader: function(fn) {
    if( !fn || typeof fn !== 'function' ) throw new TypeError('uploader must be a function');
    uploader = fn;
    
    return context;
  },
  upload: function(file, done) {
    if( uploader ) {
      uploader.apply(context, arguments);
      return context;
    }
    
    if( !win.FileReader ) return done(new Error('use context.uploader(fn) to set up your custom uploader'));
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
    
    return context;
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
    
    return context;
  },
  selectFile: function(done) {
    $('<input type="file">').on('change', function() {
      context.upload(this.files[0], done);
    }).click();
    
    return context;
  },
  
  // range
  ranges: function(node, collapsed) {
    var selection = win.getSelection();
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
    
    range = doc.createRange();
    range.selectNodeContents(start);
    var startoffset = range.startOffset;
    
    range = doc.createRange();
    range.selectNodeContents(end);
    var endoffset = range.endOffset;
    
    range = doc.createRange();
    range.setStart(start, startoffset);
    range.setEnd(end, endoffset);
    
    var selection = win.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    start.parentNode.normalize();
    
    return context;
  },
  wrap: function(range, selector) {
    if( !range ) return null;
    if( typeof selector != 'string' || !selector ) selector = 'div';
    
    var node = range.cloneContents();
    var asm = $.util.assemble(selector);
    var wrapper = doc.createElement(asm.tag);
    if( asm.id ) wrapper.id = id;
    if( asm.classes ) wrapper.className = asm.classes;
    
    wrapper.appendChild(node);
    wrapper.normalize();
    range.deleteContents();
    range.insertNode(wrapper);
    
    // select new node
    var range = doc.createRange();
    range.selectNodeContents(wrapper);
    var selection = win.getSelection();
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
    
    return context;
  },
  
  // alert
  prompt: function(message, callback, options) {
    if( context.fire('ff-prompt', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(context, prompt(message));
    }
    
    return context;
  },
  confirm: function(message, callback, options) {
    if( context.fire('ff-prompt', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(context, confirm(message));
    }
    
    return context;
  },
  alert: function(message, callback, options) {
    if( context.fire('ff-alert', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(context);
      alert(message);
    }
    
    return context;
  },
  error: function(error, callback, options) {
    if( typeof error == 'string' ) error = new Error(error);
    
    if( context.fire('ff-error', {
      error: error,
      message: error.message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(context);
      console.error(error);
      alert(error.message);
    }
    
    return context;
  },
  
  // defaults
  fonts: function(arr) {
    if( !arguments.length ) return fonts;
    fonts = new Items(arr);
    return context;
  },
  colors: function(arr) {
    if( !arguments.length ) return colors;
    colors = new Items(arr);
    return context;
  },
  
  // history
  history: function() {
    return history;
  }
};

(function() {
  var platform = win.navigator.platform;
  var mac = !!~platform.toLowerCase().indexOf('mac');
  
  $(doc).on('mousedown', function(e) {
    if( !editmode ) return;
    
    var target = e.target || e.srcElement;
    var part = context.partof(target);
    
    if( !part ) return context.focused && context.focused.blur();
    
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
