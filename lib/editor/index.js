var Part = require('./part.js');
var Toolbar = require('./toolbar.js');

require('./less/editor.less');

function ensure(fn) {
  if( document.body ) fn();
  else window.addEventListener('DOMContentLoaded', fn);
}

var Editor = function(root) {
  if( root && !Part.isElement(root) ) throw new TypeError('invalid element');
  
  var parts = {};
  var data = {};
  var types = {};
  var observer;
  var editmode = false;
  var toolbar = new Toolbar({
    fixed: true,
    top: 20,
    right: 20,
    get owner() {
      return editor;
    },
    cls: 'ff-editor-toolbar'
  });
  
  ensure(function() {
    root = root || document.body;
    root.appendChild(toolbar.element);
    
    editor.reset();
    /*observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        editor.reset();
      });
    });
    
    observer.observe(root, {
      childList: true,
      subtree: true
    });*/
  });
  
  var editor = {
    get editmode() {
      return editmode;
    },
    set editmode(b) {
      editmode = !!b;
      for(var k in parts) {
        parts[k].editmode = !!b;
      }
    },
    get data() {
      var data = {};
      for(var k in parts) data[k] = parts[k].data;
      return data;
    },
    set data(d) {
      editor.reset(d || {});
    },
    reset: function(d) {
      if( !arguments.length ) d = data;
      data = d || {};
      
      for(var k in parts) {
        if( !root.contains(parts[k].element) ) {
          parts[k].close();
          delete parts[k];
        }
      }
      
      if( !document.body ) return this;
      
      [].forEach.call(root.querySelectorAll('[ff-id]') , function(el) {
        var id = el.getAttribute('ff-id');
        var part = el.__ff__;
        
        if( !part ) {
          var type = el.getAttribute('ff-type') || 'html';
          var Type = editor.type(type);
          if( !Type ) Type = Part;
          part = el.__ff__ = new Type(el);
        }
        
        part.editor = editor;
        part.update(data[id] || null);
        part.editmode = editmode;
        
        parts[id] = part;
      });
      return this;
    },
    edit: function(b) {
      if( !arguments.length ) b = true;
      editor.editmode = !!b;
      return this;
    },
    toolbar: function() {
      return toolbar;
    },
    part: function(id) {
      return parts[id];
    },
    clear: function(id) {
      parts[id] && parts[id].data(null);
      return this;
    },
    close: function() {
      this.editmode = false;
      for(var k in parts) parts[k].close();
      return this;
    },
    type: function(type, fn) {
      if( !arguments.length ) return console.error('missing type name');
      if( arguments.length === 1 ) return types[type] || Part.types.get(type);
      types[type] = fn;
      return this;
    }
  };
  
  return editor;
};

module.exports = Editor;