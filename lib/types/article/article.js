var $ = require('tinyselector');
var Part = require('../../part.js');
var tools = require('./tools');
var Marker = require('./marker');

require('./article.less');

function ArticlePart(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  $(el).addClass('ff-article');
  
  var toolbar = this.toolbar()
  .position(tools.position || 'vertical top right outside')
  .clear();
  
  tools.forEach(function(item) {
    toolbar.add(item);
  });
  
  toolbar.always();
  
  this._marker = new Marker(this);
  this.update();
}

ArticlePart.prototype = Object.create(Part.prototype, {
  update: {
    value: function() {
      var el = $(this.dom());
      console.log('update', el.find('.ff-part'));
      
      if( this.editmode() ) {
        el.find('.ff-part')
        .attr('draggable', true);
      } else {
        
      }
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

ArticlePart.tools = tools;
ArticlePart.marker = Marker;

module.exports = ArticlePart;