var $ = require('tinyselector');
var ParagraphPart = require('../paragraph/paragraph.js');

require('./text.less');

function TextPart() {
  ParagraphPart.apply(this, arguments);
  
  this.toolbar().enable(false);
  $(this.dom()).rc('ff-paragraph').ac('ff-text');
}

TextPart.prototype = Object.create(ParagraphPart.prototype, {
  create: {
    value: function(arg) {
      var html = typeof arg == 'string' ? arg : '';
      return $('<span/>').html(html)[0];
    }
  }
});

module.exports = TextPart;