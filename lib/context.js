var $ = require('tinyselector');
var types = require('./types.js');
var Items = require('./items.js');

var win = window,
    doc = document,
    editmode = false,
    data = {},
    uploader,
    fonts = new Items(),
    colors = new Items();

var context = {
  scan: function(fn, all) {
    context.parts.apply(context, arguments);
    return context;
  },
  parts: function(fn, all) {
    if( fn === true ) all = fn;
    
    return $(all ? '.ff [ff-id], [ff], [ff-type]' : '[ff-id], [ff], [ff-type]').reverse().each(function(i, el) {
      var id = el.getAttribute('ff-id');
      var type = el.getAttribute('ff-type') || el.getAttribute('ff') || 'default';
      var part = el._ff;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[ff] not found type: ' + type);
        part = el._ff = new Type(el);
        id && data[id] && part.data(data[id]);
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
    
    $('[ff-id]').reverse().each(function(i, el) {
      var id = el.getAttribute('ff-id');
      var type = el.getAttribute('ff-type') || el.getAttribute('ff') || 'default';
      var part = el._ff;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[ff] not found type: ' + type);
        part = new Type(el);
      }
      
      data[id] && part.data(data[id]);
    });
    
    context.fire('ff-data', {
      data: newdata
    });
    
    return context;
  },
  reset: function() {
    console.warn('[ff] ff.reset is deprecated, use ff.data instead');
    return context.data.apply(context, arguments);
  },
  get: function() {
    console.warn('[ff] ff.get is deprecated, use ff.partof instead');
    return context.partof.apply(context, arguments);
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
  partsof: function(node) {
    var parents = [];
    $(node).parent(function() {
      var part = this._ff;
      if( part ) parents.push(part);
    }, true);
    return parents;
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
    uploader.call(context, file, function(err, result) {
      if( err ) context.fire('ff-upload-error', {error: err});
      if( err ) return done && done(err);
      
      context.fire('ff-upload', {result:result});
      done && done(null, result);
    });
    return context;
  },
  selectFiles: function(done, options) {
    options = options || {};
    if( typeof options == 'boolean'  ) options = {upload:options};
    if( typeof options == 'string'  ) options = {type:options};
    if( typeof options == 'number'  ) options = {limit:options};
    
    var type = options.type;
    var upload = options.upload === false ? false : true;
    var limit = options.limit;
    
    $('<input type="file">').attr('multiple', limit === 1 ? null : '').on('change', function() {
      var files = [].slice.call(this.files);
      
      if( limit && files.length ) files = files.slice(0, limit);
      
      if( type ) {
        var tmp = [];
        files.forEach(function(file) {
          if( file.type && !file.type.indexOf(type) ) tmp.push(file);
        });
        files = tmp;
      }
      
      if( !upload ) return done(null, files);
      
      var srcs = [];
      $(files).async(function(file, done) {
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
  selectFile: function(done, options) {
    options = options || {};
    options.limit = 1;
    return context.selectFiles(function(err, arr) {
      if( err ) return done(err);
      done(null, arr && arr[0]);
    }, options);
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
  }
};

$(doc).on('mousedown', function(e) {
  if( !editmode ) return;
  
  var target = e.target || e.srcElement;
  var part = context.partof(target);
  var focused = context.focused;
  
  if( part ) part.focus();
  else focused && focused.blur();
});

module.exports = context;
