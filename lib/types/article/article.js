var $ = require('tinyselector');
var Part = require('../../part.js');
var components = require('./components.js');
var Marker = require('./marker');
var DnD = require('./dnd');

require('./article.less');

function ArticlePart() {
  Part.apply(this, arguments);
}

var proto = ArticlePart.prototype = Object.create(Part.prototype);

proto.oninit = function(e) {
  $(this.dom()).ac('ff-article')
  .on('click', function(e) {
    if( this.editmode() && e.target === this.dom() ) {
      this.validate();
      
      var children = this.children();
      if( children.length ) {
        var p = Part(children[children.length - 1]);
        p && p.focus();
      }
    }
  }.bind(this));
  
  this.toolbar()
  .position('vertical top right outside')
  .add({
    text: '<i class="fa fa-eraser"></i>',
    tooltip: '내용 삭제',
    fn: function(e) {
      this.owner().clear();
    }
  }, 0)
  .add(components)
  .always(true);
};

proto.validate = function() {
  var dom = this.dom();
  var el = $(dom);
  var editmode = this.editmode();
  var context = this.context();
  
  if( this.editmode() ) {
    var marker = this.marker();
    var viewport = el.children('.ff-article-viewport');
    if( !viewport.length ) {
      viewport = $('<div class="ff-article-viewport"/>');
      
      el.nodes().each(function() {
        viewport.append(this);
      })
    
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
    
    viewport.find('.ff-video').each(function() {
      if( !this.__ff__) new context.Video(this);
    });
    
    viewport.find('.ff-image').each(function() {
      if( !this.__ff__) new context.Image(this);
    });
    
    viewport.find('.ff-paragraph').each(function() {
      if( !this.__ff__) new context.Paragraph(this);
    });
    
    viewport.find('.ff-separator').each(function() {
      if( !this.__ff__) new context.Separator(this);
    });
    
    viewport.find('.ff-text').each(function() {
      if( !this.__ff__) new context.Text(this);
    });
    
    viewport.find('.ff-file').each(function() {
      if( !this.__ff__) new context.File(this);
    });
    
    viewport.children().each(function() {
      if( !this.matches || this.matches('.ff-acc') ) return;
      
      var tag = this.tagName;
      var part = this.__ff__;
      
      if( !part ) {
        if( tag == 'IMG' ) part = new context.Image(this);
        else if( tag == 'HR' ) part = new context.Separator(this);
        else part = new context.Paragraph(this);
      }
    });
  } else {
    var viewport = el.children('.ff-article-viewport');
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
  
  var placeholder = el.attr('placeholder');
  el.find('.ff').each(function() {
    var part = Part(this);
    if( part ) {
      part.removable(true);
      if( part.editmode() !== editmode ) part.editmode(editmode);
      if( part instanceof context.Paragraph ) part.placeholder(placeholder);
    }
  });
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

proto.getPart = function(index) {
  var el = $(this.viewport()).children('.ff')[index];
  return el && el.__ff__;
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
    return !($(this).hc('ff-marker') || $(this).hc('ff-placeholder'));
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
  
  $(node).reverse().each(function() {
    var el = (this.dom && this.dom()) || this;
    
    if( window.File && this instanceof window.File ) {
      var type = this.type;
      
      if( type ) {
        context.upload(this, function(err, result) {
          if( type.indexOf('image/') === 0 ) {
            part.insert(new context.Image(result), ref);
          } else {
            part.insert(new context.File(result), ref);
          }
        });
      }
    } else if( ref ) {
      ref.parentNode && ref.parentNode.insertBefore(el, ref);
    } else {
      target.append(el);
    }
  });
  
  this.fire('insert', {
    node: node,
    ref: ref,
    target: target
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


ArticlePart.components = components;
ArticlePart.Marker = Marker;
ArticlePart.DnD = DnD;

module.exports = ArticlePart;