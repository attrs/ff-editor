var $ = require('tinyselector');
var Part = require('../../part.js');
var components = require('./components.js');
var Marker = require('./marker');
var DnD = require('./dnd');

require('./article.less');

function ArticlePart(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  $(el).addClass('ff-article');
  
  var toolbar = this.toolbar()
  .position('vertical top right outside')
  .clear()
  .add({
    text: '<i class="fa fa-eraser"></i>',
    tooltip: '내용 삭제',
    fn: function(e) {
      this.owner().clear();
    }
  });
  
  components.forEach(function(item) {
    toolbar.add(item);
  });
  
  toolbar.always();
  
  this._marker = new Marker(this);
  this._dnd = new DnD(this);
  this.update();
}

ArticlePart.prototype = Object.create(Part.prototype, {
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
  }
});

ArticlePart.components = components;
ArticlePart.Marker = Marker;

module.exports = ArticlePart;