var types = require('./types.js');
var Part = require('./part.js');

require('./less/index.less');

function partify(el, data) {
  var part = el.__ff__;
  if( !part ) part = el.__ff__ = new Part(el);
  part.data = data;
  return part;
}

function ensure(fn) {
  if( document.body ) fn();
  else window.addEventListener('DOMContentLoaded', fn);
}

var observer;
function Page(data) {
  this.data = data = data || {};
  var parts = this.parts = {};
  
  var self = this;
  ensure(function() {
    self.reset();
    
    if( observer ) observer.disconnect();
    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        self.check();
        
        [].forEach.call(mutation.addedNodes, function(node) {
          if( node.nodeType === 1 ) {
            if( node.getAttribute('ff-id') ) {
              var id = node.getAttribute('ff-id');
              parts[id] = partify(node, data[id]);
            };
            
            [].forEach.call(node.querySelectorAll('[ff-id]'), function(node) {
              var id = node.getAttribute('ff-id');
              parts[id] = partify(node, data[id]);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

Page.prototype = {
  check: function() {
    var parts = this.parts;
    for(var k in parts) {
      if( !document.body.contains(parts[k].element) ) {
        parts[k].close();
        delete parts[k];
      }
    }
  },
  reset: function() {
    var data = this.data;
    var parts = this.parts;
    
    [].forEach.call(document.querySelectorAll('[ff-id]') , function(el) {
      if( !el.getAttribute('ff-id') ) return;
      
      var id = el.getAttribute('ff-id');
      parts[id] = partify(el, data[id]);
    });
    return this;
  },
  part: function(id) {
    return parts[id];
  },
  clear: function(id) {
    parts[id] && parts[id].data(null);
    return this;
  },
  update: function(data) {
    this.data = data || {};
    this.reset();
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) b = true;
    for(var k in this.parts) this.parts[k].editmode(!!b);
    return this;
  },
  close: function() {
    for(var k in parts) parts[k].close();
    return this;
  }
};

var page, extensions = [];
var ctx = module.exports = {
  page: function() {
    return page;
  },
  render: function(data, done) {
    done = typeof done === 'function' ? done : function(err) { if( err ) return console.error(err); };
    
    if( page ) page.update(data);
    else page = new Page(data);
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) b = true;
    if( !page ) page = new Page();
    page.editmode(!!b);
    return this;
  },
  types: types,
  extensions: extensions,
  extension: function(fn) {
    if( typeof fn !== 'function' ) throw new TypeError('extension must be a function');
    fn(ctx);
    extensions.push(fn);
    return this;
  }
};

