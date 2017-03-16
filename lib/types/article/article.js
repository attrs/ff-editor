var $ = require('tinyselector');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar/');
var components = require('./components.js');
var Marker = require('./marker');
var DnD = require('./dnd');

require('./article.less');

function ArticlePart(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  $(el).addClass('ff-article');
  
  var toolbar = this.toolbar()
  .add({
    text: '<i class="fa fa-eraser"></i>',
    tooltip: '내용 삭제',
    fn: function(e) {
      this.owner().clear();
    }
  }, 0)
  .always();
  
  var sidebar = new Toolbar(this)
  .position('vertical top right outside');
  
  components.forEach(function(item) {
    sidebar.add(item);
  });
  
  this._marker = new Marker(this);
  this._dnd = new DnD(this);
  this._sidebar = sidebar;
  this.update();
}

ArticlePart.prototype = Object.create(Part.prototype, {
  update: {
    value: function() {
      var ctx = this.context();
      var placeholder = $(this.dom()).attr('placeholder');
      if( placeholder && !this.children().length ) {
        this.insert(new ctx.Paragraph().placeholder(placeholder));
      }
      
      if( this.editmode() ) {
        this._dnd.update();
      }
    }
  },
  oninit: {
    value: function(e) {
      this.update();
    }
  },
  onchildlist: {
    value: function(e) {
      this.update();
    }
  },
  onclick: {
    value: function(e) {
      if( this.editmode() && e.target === this.dom() ) {
        if( this.children().length === 1 ) {
          var part = this.getPart(0);
          part && part.click();
        }
      }
    }
  },
  onmodechange: {
    value: function(e) {
      var sidebar = this.sidebar();
      if( this.editmode() ) sidebar.show();
      else sidebar.hide();
    }
  },
  onmousemove: {
    value: function(e) {
      this.sidebar().update();
    }
  },
  sidebar: {
    value: function() {
      return this._sidebar;
    }
  },
  marker: {
    value: function() {
      return this._marker;
    }
  },
  oninsert: {
    value: function() {
      this.update();
    }
  },
  oneditmode: {
    value: function() {
      this.update();
    }
  },
  onnormalmode: {
    value: function() {
      this.update();
    }
  },
  clear: {
    value: function() {
      this.dom().innerHTML = '';
      return this;
    }
  },
  get: {
    value: function(index) {
      return this.children()[index];
    }
  },
  getPart: {
    value: function(index) {
      var el = $(this.dom()).children('.ff-part')[index];
      return el && el.__ff__;
    }
  },
  find: {
    value: function(selector) {
      return $(this.dom()).find(selector);
    }
  },
  indexOf: {
    value: function(node) {
      if( !node ) return -1;
      node = node.dom() || node;
      return $(this.dom()).indexOf(node);
    }
  },
  children: {
    value: function() {
      return $(this.dom()).children().filter(function() {
        return !($(this).hc('ff-marker') || $(this).hc('ff-placeholder'));
      });
    }
  },
  insert: {
    value: function(node, ref) {
      var context = this.context();
      var part = this;
      var target = $(this.dom());
      var marker = this.marker();
      var children = this.children();
      
      if( arguments.length <= 1 && marker.isExpanded() ) {
        ref = children[marker.getIndex()];
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
                part.insert(new context.Image(result));
              } else {
                part.insert(new Attachment(result));
              }
            });
          }
        } else if( ref ) {
          ref.parentNode.insertBefore(el, ref);
        } else {
          target.append(el);
        }
      });
      
      this.fire('insert', {
        node: node,
        ref: ref,
        target: target
      });
      
      this.update();
      
      return this;
    }
  }
});

ArticlePart.components = components;
ArticlePart.Marker = Marker;

module.exports = ArticlePart;