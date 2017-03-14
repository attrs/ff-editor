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
  update: {
    value: function() {
      this._dnd.update();
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
      return $(this.dom()).children()[index];
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
        return !$(this).hc('ff-marker');
      });
    }
  },
  insert: {
    value: function(node, ref) {
      var partel = this.dom();
      var marker = this.marker();
      //var range = this.range();
      var children = this.children();
      var markerIndex = -1;
      
      if( marker.isExpanded() ) {
        markerIndex = marker.getIndex();
        marker.collapse();
      }
      
      node = $(node);
      ref = typeof ref == 'number' ? children[ref] : (ref || children[markerIndex]);
      
      node.reverse().each(function() {
        var el = this.dom() || this;
        if( ref ) ref.parentNode.insertBefore(el, ref);
        //else if( range ) range.insertNode(el);
        else partel.appendChild(el);
      });
      
      this.fire('insert', {
        nodes: node,
        ref: ref
      });
      
      return this;
    }
  }
});

ArticlePart.components = components;
ArticlePart.Marker = Marker;

module.exports = ArticlePart;