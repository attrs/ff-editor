var $ = require('tinyselector');
var Part = require('../../part.js');
var buildtoolbar = require('./toolbar.js');

require('./paragraph.less');

function ParagraphPart() {
  Part.apply(this, arguments);
}

var proto = ParagraphPart.prototype = Object.create(Part.prototype);

proto.oninit = function(e) {
  var part = this;
  var el = $(part.dom()).ac('ff-paragraph')
  .on('dragstart', function(e) {
    if( part.editmode() ) {
      e.stopPropagation();
      e.preventDefault();
    }
  });
  
  buildtoolbar(this);
  
  var placeholder = part._placeholder = (function() {
    var node = $('<div class="ff-placeholder"/>'), text;
    
    return {
      text: function(o) {
        text = o;
        node.html(text);
        return this;
      },
      show: function() {
        if( part.editmode() ) el.attr('contenteditable', null);
        node.html(text).remove();
        if( !part.text() ) el.empty().append(node);
        return this;
      },
      hide: function() {
        if( part.editmode() ) el.attr('contenteditable', true);
        node.remove();
        return this;
      }
    };
  })();
  
  placeholder.text(el.attr('placeholder') || ParagraphPart.placeholder || this.context().placeholder);
};

proto.onchildlist = function() {
  if( this.editmode() ) this.placeholder().show();
};

proto.text = function(text) {
  var el = $(this.dom());
  if( !arguments.length ) return el.text().split('\n').join().trim();
  
  el.text(text);
  return this;
};

proto.onfocus = function() {
  if( !this.editmode() ) return;
  
  this.placeholder().hide();
  
  var el = this.dom();
  var selection = window.getSelection();
  var range = selection.rangeCount && selection.getRangeAt(0);
  
  if( !range || !(el.contains(range.startContainer) && el.contains(range.endContainer))
   || el === range.startContainer
   || el === range.endContainer ) {
    selection.removeAllRanges();
    setTimeout(function() {
      el.focus();
      el.click();
    }, 10);
  }
};

proto.onblur = function() {
  if( this.editmode() )
    this.placeholder().show();
};

proto.oneditmode = function(e) {
  $(this.dom()).attr('contenteditable', true);
  this.placeholder().show();
};

proto.onviewmode = function(e) {
  $(this.dom()).attr('contenteditable', null);
  this.placeholder().hide();
};

proto.create = function(arg) {
  var html = typeof arg == 'string' ? arg : '';
  return $('<p/>').html(html)[0];
};

proto.placeholder = function(placeholder) {
  if( !arguments.length ) return this._placeholder;
  this._placeholder.text(placeholder);
  return this;
};

module.exports = ParagraphPart;


