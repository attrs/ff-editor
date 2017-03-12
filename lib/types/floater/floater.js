var $ = require('tinyselector');
var Part = require('../../part.js');

require('./floater.less');

function FloaterPart(el) {
  Part.call(this, el);
  
  var el = this.dom();
  $(el).attr('class', 'ff-floater');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-circle-o"></i>',
    fn: function(e) {
    }
  }, 0);
}

FloaterPart.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      return document.createElement('div');
    }
  }
});

module.exports = FloaterPart;

