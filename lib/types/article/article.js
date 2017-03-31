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
  .add('-')
  .add(items)
  .always(true);
};

proto.oninit = function(e) {
  var part = this;
  var dom = this.dom();
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
      console.log('DOMNodeInserted');
      part.scan();
    });
  }
  
  this.scan();
};

proto.scan = function() {
  var dom = $(this.dom());
  var editmode = this.editmode();
  
  context.scan();
  
  dom.find('img').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Image(this);
  });
  
  dom.find('h1 h2 h3 h4 h5 h6 blockquote').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Paragraph(this);
  });
  
  dom.find('hr').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Separator(this);
  });
  
  dom.children().each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__ ) new context.Paragraph(this);
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
};

proto.validate = function() {
  var dom = this.dom();
  var el = $(dom);
  var editmode = this.editmode();
  
  if( this.editmode() ) {
    if( this._mk ) this._mk.destroy();
    if( this._dnd ) this._dnd.destroy();
    this._mk = Marker(this, dom);
    this._dnd = DnD(this, dom);
    
    if( !this.children().length ) {
      this.insert(new context.Paragraph());
    }
  } else {
    this._mk && this._mk.destroy();
    this._dnd && this._dnd.destroy();
    delete this._mk;
    delete this._dnd;
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
  this.dom().innerHTML = '';
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

proto.html = function(html) {
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var html = this.dom().innerHTML;
    this.editmode(editmode);
    var tmp = $('<div/>').html(html);
    tmp
    .find('.ff, .ff-edit-state, .ff-enter-state, .ff-focus-state, .ff-dragging, [draggable], [contenteditable]')
    .rc('ff ff-edit-state ff-enter-state ff-focus-state ff-dragging')
    .attr('draggable', null)
    .attr('contenteditable', null);
    
    tmp.find('.ff-acc').remove();
    
    return tmp.html();
  }
  
  this.dom().innerHTML = html || '';
  this.validate();
  return this;
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
      $.util.chunk(images, 5).forEach(function(arr) {
        var row = new context.Row().valign('justify');
        arr.forEach(function(image) {
          row.add(image);
        });
        part.insert(row);
      });
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