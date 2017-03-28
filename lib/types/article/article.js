var $ = require('tinyselector');
var context = require('../../context.js');
var Part = context.Part;
var Toolbar = context.Toolbar;
var Marker = require('./marker');
var DnD = require('./dnd');

require('./article.less');

function ArticlePart() {
  Part.apply(this, arguments);
}

var items = ArticlePart.toolbar = require('./toolbar.js');
var proto = ArticlePart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'vertical top right outside')
  .add({
    text: '<i class="fa fa-eraser"></i>',
    tooltip: '내용 삭제',
    fn: function(e) {
      this.clear();
    }
  }, 0)
  .add(items)
  .always(true);
};

proto.oninit = function(e) {
  $(this.dom()).ac('ff-article')
  .on('click', function(e) {
    var target = e.target || e.srcElement;
    if( this.editmode() && target === this.viewport() ) {
      this.validate();
      
      var children = this.children();
      if( children.length ) {
        var p = Part(children[children.length - 1]);
        p && p.focus();
      }
    }
  }.bind(this));
  
  this.scan();
};

proto.scan = function() {
  var viewport = $(this.viewport());
  var editmode = this.editmode();
  
  context.scan();
  
  viewport.find('img').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Image(this);
  });
  
  viewport.find('p h1 h2 h3 h4 h5 h6 blockquote').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Paragraph(this);
  });
  
  viewport.find('hr').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Separator(this);
  });
  
  viewport.children().each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__ ) new context.Paragraph(this);
  });
  
  var placeholder = $(this.dom()).attr('placeholder');
  viewport.find('.ff').each(function() {
    var part = Part(this);
    if( part ) {
      part.removable(true);
      if( part.editmode() !== editmode ) part.editmode(editmode);
      if( part instanceof context.Paragraph ) part.placeholder(placeholder);
    }
  });
};

proto.validate = function() {
  var dom = this.dom();
  var el = $(dom);
  var editmode = this.editmode();
  
  if( this.editmode() ) {
    var marker = this.marker();
    var viewport = el.children('.f_article_view');
    if( !viewport.length ) {
      viewport = $('<div class="f_article_view"/>');
      
      el.nodes().each(function() {
        viewport.append(this);
      });
    
      el.append(viewport);
      this._viewport = viewport[0];
      
      if( this._mk ) this._mk.destroy();
      if( this._dnd ) this._dnd.destroy();
      this._mk = Marker(this, viewport[0]);
      this._dnd = DnD(this, viewport[0]);
    }
    
    if( !this.children().length ) {
      this.insert(new context.Paragraph());
    }
  } else {
    var viewport = el.children('.f_article_view');
    if( viewport.length ) {
      el.empty();
      $(this._viewport).nodes().each(function() {
        el.append(this);
      });
    }
    
    this._mk && this._mk.destroy();
    this._dnd && this._dnd.destroy();
    delete this._mk;
    delete this._dnd;
    delete this._viewport;
  }
  
  this.scan();
  
  return this;
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
  this.viewport().innerHTML = '';
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
  return $(this.viewport()).indexOf(node);
};

proto.children = function() {
  return $(this.viewport()).children().filter(function() {
    return !($(this).hc('ff-acc'));
  });
};

proto.viewport = function() {
  return this._viewport || this.dom();
};

proto.html = function(html) {
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var html = this.dom().innerHTML;
    this.editmode(editmode);
    return html;
  }
  
  this.viewport().innerHTML = html || '';
  this.validate();
  return this;
};

proto.insert = function(node, ref) {
  var context = this.context();
  var part = this;
  var target = $(this.viewport());
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
  }
  
  var images = [];
  $(node).reverse().async(function(item, done) {
    var el = (item.dom && item.dom()) || item;
      
    if( window.File && item instanceof File ) {
      var type = item.type;
      
      return context.upload(item, function(err, result) {
        if( err ) return done(err);
        
        if( type.indexOf('image/') === 0 )
          images.push(new context.Image(result));
        else
          insert(new context.Link(result).dom(), ref);
        
        done();
      });
    } else {
      insert(el, ref);
    }
    
    done();
  }, function(err) {
    if( err ) return context.error(err);
    
    if( images.length === 1 ) {
      insert(images[0].dom(), ref);
    } else if( images.length ) {
      var row = new context.Row();
      images.reverse().forEach(function(image) {
        row.add(image);
      });
      
      insert(row.dom(), ref);
    }
    
    part.fire('insert', {
      node: node,
      ref: ref,
      target: target
    });
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


ArticlePart.Marker = Marker;
ArticlePart.DnD = DnD;

module.exports = ArticlePart;