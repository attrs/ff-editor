var $ = require('tinyselector');
var context = require('../../context.js');
var tools = require('../../tools.js');
var Items = require('../../items.js');
var Part = context.Part;
var Toolbar = context.Toolbar;
var Marker = require('./marker');
var DnD = require('./dnd');

require('./article.less');

function ArticlePart() {
  Part.apply(this, arguments);
}

var proto = ArticlePart.prototype = Object.create(Part.prototype);
var items = ArticlePart.toolbar = new Items([
  tools.clear,
  '-',
  tools.insert.heading,
  tools.insert.paragraph,
  tools.insert.imagefile,
  tools.insert.image,
  tools.insert.video,
  tools.insert.separator,
  tools.insert.link,
  tools.insert.attach
]);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'vertical top right outside')
  .add(items)
  .always(true);
};

proto.oninit = function(e) {
  var part = this;
  var dom = this.dom();
  
  part.toolbar().remove('clearfix');
  
  $(dom).ac('ff-article')
  .on('click', function(e) {
    var target = e.target || e.srcElement;
    if( part.editmode() && target === part.dom() ) {
      part.validate();
      
      var children = part.children();
      if( children.length ) {
        var p = Part(children[children.length - 1]);
        p && p.focus();
      }
    }
  });
  
  if( window.MutationObserver ) {
    var observer = this._observer = new MutationObserver(function() {
      part.scan();
    });
    
    observer.observe(dom, {
      childList: true
    });
  } else {
    dom.addEventListener('DOMNodeInserted', function() {
      part.scan();
    });
  }
  
  this.scan();
};

proto.scan = function() {
  var dom = $(this.dom());
  var editmode = this.editmode();
  
  context.scan();
  
  dom.find('figure').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this._ff ) new context.Image(this);
  });
  
  dom.find('img').each(function() {
    if( $(this).hc('ff-acc') || this.parentNode.tagName == 'FIGURE' ) return;
    if( !this._ff ) new context.Image(this);
  });
  
  dom.find('blockquote').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this._ff ) new context.Paragraph(this);
  });
  
  dom.find('h1, h2, h3, h4, h5, h6').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this._ff ) new context.Heading(this);
  });
  
  dom.find('hr').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this._ff ) new context.Separator(this);
  });
  
  dom.children().each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this._ff ) new context.Paragraph(this);
  });
  
  var placeholder = $(this.dom()).attr('placeholder');
  dom.find('.ff').each(function() {
    var part = Part(this);
    if( part ) {
      part.removable(true);
      if( part.editmode() !== editmode ) part.editmode(editmode);
      if( part instanceof context.Paragraph ) part.placeholder(placeholder);
    }
  });
  
  if( !dom.nodes().length ) {
    dom.append(new context.Paragraph().placeholder(placeholder).dom());
  }
};

proto.validate = function() {
  var part = this;
  var dom = part.dom();
  var el = $(dom);
  var editmode = part.editmode();
  
  if( part.editmode() ) {
    if( !part._mk ) part._mk = Marker(part, dom);
    if( !part._dnd ) part._dnd = DnD(part, dom);
  } else {
    if( part._mk ) part._mk.destroy();
    if( part._dnd ) part._dnd.destroy();
    delete part._mk;
    delete part._dnd;
  }
  
  part.scan();
  
  return part;
};

proto.onmodechange = function(e) {
  this.validate();
};

proto.marker = function() {
  return this._mk;
};

proto.oninsert = function() {
  this.validate();
};

proto.clear = function() {
  this.dom().innerHTML = '';
  this.validate();
  return this;
};

proto.get = function(index) {
  return this.children()[index];
};

proto.find = function(selector) {
  return $(this.dom()).find(selector);
};

proto.indexOf = function(node) {
  if( !node ) return -1;
  node = node.dom() || node;
  return $(this.dom()).indexOf(node);
};

proto.children = function() {
  return $(this.dom()).children().filter(function() {
    return !($(this).hc('ff-acc'));
  });
};

proto.insert = function(node, ref) {
  var context = this.context();
  var part = this;
  var target = $(this.dom());
  var marker = this.marker();
  var children = this.children();
  
  if( arguments.length <= 1 && marker.isExpanded() ) {
    ref = marker.getRef();
    marker.collapse();
  } else if( typeof ref == 'number' ) {
    ref = children[ref];
  }
  
  var insert = function(node, ref) {
    if( ref ) ref.parentNode && ref.parentNode.insertBefore(node, ref);
    else target.append(node);
    
    node._ff && node._ff.focus();
  };
  
  var images = [];
  $(node).reverse().async(function(item, done) {
    var el = (item.dom && item.dom()) || item;
    
    if( window.File && item instanceof File ) {
      return (function(type) {
        context.upload(item, function(err, result) {
          if( err ) return done(err);
          
          if( type.indexOf('image/') !== 0 ) {
            insert(new context.Link(result).dom(), ref);
          } else {
            images.push(new context.Image(result));
          }
        
          done();
        });
      })(item.type);
    } else {
      insert(el, ref);
    }
    
    done();
  }, function(err) {
    if( err ) return context.error(err);
    
    if( images.length === 1 ) {
      insert(images[0].dom(), ref);
    } else if( images.length ) {
      var chunksize = +target.attr('ff-row-chunk-size');
      
      images.reverse();
      
      if( !chunksize || chunksize < 1 ) chunksize = 5;
      $.util.chunk(images, chunksize).forEach(function(arr) {
        var row = new context.Row().valign('justify');
        arr.forEach(function(image) {
          row.add(image);
          image.on('load', function() {
            row.validate();
          });
        });
        insert(row.dom(), ref);
      });
    }
    
    part.fire('ff-insert', {
      node: node,
      ref: ref,
      target: target
    });
    
    part.history().save();
  });
  
  return this;
};

proto.getData = function() {
  return {
    html: this.html()
  };
};

proto.setData = function(data) {
  this.html(data && data.html);
  return this;
};

proto.createHistory = function() {
  var part = this;
  var dom = part.dom();
  var children = part.children().slice();
  
  return (function(children, cls, css) {
    return function() {
      $(dom).empty().append(children);
      dom.className = cls || '';
      dom.style.cssText = css || '';
      part.focus();
    };
  })(children, dom.className, dom.style.cssText);
};


ArticlePart.Marker = Marker;
ArticlePart.DnD = DnD;

module.exports = ArticlePart;