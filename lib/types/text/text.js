var $ = require('tinyselector');
var ParagraphPart = require('../paragraph/paragraph.js');

require('./text.less');

function TextPart() {
  ParagraphPart.apply(this, arguments);
  
  this.toolbar().enable(false);
  $(this.dom()).rc('ff-paragraph').ac('ff-text')
  .on('keydown', function(e) {
    if( e.keyCode === 13 ) {
      e.preventDefault();
    }
  })
  .on('paste', function(e) {
    e.preventDefault();
    
    var clipboard = e.clipboardData || window.clipboardData;
    var text = clipboard.getData('Text');
    this.innerText = text.split('\n').join(' ');
  });
}

var proto = TextPart.prototype = Object.create(ParagraphPart.prototype);

proto.create = function(arg) {
  var html = typeof arg == 'string' ? arg : '';
  return $('<span/>').html(html)[0];
};

proto.html = ParagraphPart.prototype.text;

module.exports = TextPart;