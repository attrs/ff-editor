var Part = require('./part.js');
var Toolbar = require('./toolbar.js');

require('./less/index.less');

function ensure(fn) {
  if( document.body ) fn();
  else window.addEventListener('DOMContentLoaded', fn);
}

var Editor = function(root) {
  if( root && !Part.isElement(root) ) throw new TypeError('invalid element');
  
  var parts = [];
  var data = {};
  var types = {};
  var observer;
  var editmode = false;
  
  var editor = {
    element: function() {
      return root || document.body;
    },
    editmode: function(b) {
      if( !arguments.length ) return editmode;
      editmode = !!b;
      
      parts.forEach(function(part) {
        part.editmode(!!b);
      });
      
      toolbar.update();
      return this;
    },
    data: function(d) {
      if( !arguments.length ) {
        var data = {};
        Object.keys(parts).forEach(function(k) {
          var part = parts[k] && parts[k];
          if( part.id() ) {
            data[part.id()] = part.data();
          }
        });
        return data;
      }
      
      editor.reset(d || {});
      return this;
    },
    reset: function(d) {
      if( !document.body ) return console.error('dom is not ready');
      if( !arguments.length ) d = data;
      
      var oeditmode = this.editmode();
      this.editmode(false);
      
      data = d || {};
      toolbar.update();
      
      var root = this.element();
      
      parts.forEach(function(part) {
        part.destroy();
        delete part.element().__ff__;
      });
      
      parts = [];
      this.scan();
      
      this.editmode(oeditmode);
      return this;
    },
    scan: function() {
      var root = this.element();
      [].forEach.call(root.querySelectorAll('[ff-id], [ff-type]') , function(el) {
        var id = el.getAttribute('ff-id');
        var type = el.getAttribute('ff-type') || 'html';
        var part = el.__ff__;
        
        if( !part ) {
          var Type = editor.type(type);
          if( !Type ) return console.warn('[firefront] not exists part type: ' + type);
          part = el.__ff__ = new Type(el);
          data[id] && part.data(data[id]);
        }
        
        part.editor(editor);
        parts.push(part);
        if( id ) parts[id] = part;
      });
    },
    toolbar: function() {
      return toolbar;
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
    destroy: function() {
      this.editmode(false);
      parts.forEach(function(part) {
        part.destroy();
      });
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
  
  ensure(function() {
    editor.reset();
  });
  
  return editor;
};

module.exports = Editor;