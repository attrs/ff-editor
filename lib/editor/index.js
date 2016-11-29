var Part = require('./part.js');
var Toolbar = require('./toolbar.js');

require('./less/index.less');

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
  
  ensure(function() {
    editor.reset();
  });
  
  var editor = {
    element: function() {
      return root || document.body;
    },
    editmode: function(b) {
      if( !arguments.length ) return editmode;
      editmode = !!b;
      for(var k in parts) {
        parts[k].editmode(!!b);
      }
      return this;
    },
    data: function(d) {
      if( !arguments.length ) {
        var data = {};
        for(var k in parts) data[k] = parts[k].data();
        return data;
      }
      
      editor.reset(d || {});
      return this;
    },
    reset: function(d) {
      if( !arguments.length ) d = data;
      data = d || {};
      if( !document.body ) return this;
      
      var root = this.element();
      
      (function() {
        for(var k in parts) {
          var el = parts[k].element();
          if( !root.contains(el) ) {
            parts[k].destroy();
            delete el.__ff__;
            delete parts[k];
          }
        }
      })();
      
      [].forEach.call(root.querySelectorAll('[ff-id], [ff-type]') , function(el) {
        var id = el.getAttribute('ff-id');
        var type = el.getAttribute('ff-type') || 'html';
        var part = el.__ff__;
        
        if( !part ) {
          var Type = editor.type(type);
          if( !Type ) Type = Part;
          part = el.__ff__ = new Type(el);
        }
        
        part.editor(editor);
        part.data(data[id] || null);
        part.editmode(editmode);
        
        parts[id] = part;
      });
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
    destroy: function() {
      this.editmode(false);
      for(var k in parts) parts[k].destroy();
      return this;
    },
    type: function(type, fn) {
      if( !arguments.length ) return console.error('missing type name');
      if( arguments.length === 1 ) return types[type] || Part.types.get(type);
      types[type] = fn;
      return this;
    }
  };
  
  var toolbar = new Toolbar(editor, {
    fixed: true,
    top: 20,
    right: 20,
    cls: 'ff-editor-toolbar'
  });
  
  return editor;
};

module.exports = Editor;