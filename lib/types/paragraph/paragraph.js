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
  var dom = part.dom();
  var el = $(dom).ac('ff-paragraph')
  .on('dragstart', function(e) {
    if( part.editmode() ) {
      e.stopPropagation();
      e.preventDefault();
    }
  });
  
  buildtoolbar(this);
  
  var placeholder = part._placeholder = (function() {
    var node = $('<div class="ff-placeholder"/>'), text, minWidthWrited = false;
    
    return {
      text: function(o) {
        if( !arguments.length ) return text;
        text = o;
        node.html(text);
        return this;
      },
      show: function() {
        if( part.editmode() ) el.attr('contenteditable', null);
        node.html(text).remove();
        var t = el.text().split('\n').join().trim();
        
        if( !t ) el.empty().append(node);
        
        var display = window.getComputedStyle(dom, null).display;
        if( ~['inline', 'inline-block'].indexOf(display) && node[0].clientWidth ) {
          dom.style.minWidth = node[0].clientWidth + 'px';
          minWidthWrited = true;
        }
        
        return this;
      },
      hide: function() {
        if( part.editmode() ) el.attr('contenteditable', true);
        else if( minWidthWrited ) dom.style.minWidth = '';
        
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
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var text = el.text().split('\n').join().trim();
    this.editmode(editmode);
    return text;
  }
  
  el.text($('<div/>').html(text).text());
  return this;
};

proto.html = function(html) {
  var el = $(this.dom());
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var html = el.html();
    this.editmode(editmode);
    return html;
  }
  
  el.html(html);
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
  return $('<div/>').html(html)[0];
};

proto.placeholder = function(placeholder) {
  if( !arguments.length ) return this._placeholder;
  this._placeholder.text(placeholder);
  return this;
};

proto.getData = function() {
  this.placeholder().hide();
  var html = this.dom().innerHTML;
  if( this.editmode() ) this.placeholder().show();
  
  return {
    html: html
  };
};

proto.setData = function(data) {
  var html = (!data || typeof data == 'string') ? data : data.html;
  this.html(html);
  this.placeholder().show();
  return this;
};

module.exports = ParagraphPart;


