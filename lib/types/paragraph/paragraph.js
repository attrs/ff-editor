var $ = require('tinyselector');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar/');
var context = require('../../context.js');
var autoflush = require('../../autoflush.js');
var win = window;
var doc = document;

require('./paragraph.less');

function ParagraphPart() {
  Part.apply(this, arguments);
}

var proto = ParagraphPart.prototype = Object.create(Part.prototype);
var items = ParagraphPart.toolbar = require('./toolbar.js');

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.oninit = function(e) {
  var part = this;
  var dom = part.dom();
  var flush = autoflush(function(items) {
    part.history().save();
  }, 200);
  
  var el = $(dom)
  .on('paste', function(e) {
    //if( part.multiline() ) return;
    
    e.preventDefault();
    
    var selection = win.getSelection();
    var range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    var clipboard = e.clipboardData || win.clipboardData;
    var text = clipboard.getData('Text');
    
    if( text && range ) {
      var node = doc.createTextNode(text);
      range.deleteContents();
      range.insertNode(node);
      
      var newrange = doc.createRange();
      newrange.selectNode(node);
      
      selection.removeAllRanges();
      selection.addRange(newrange);
      dom.normalize();
    }
  })
  .on('keydown', function(e) {
    if( part.editmode() && !e.metaKey && !e.ctrKey ) flush();
    if( e.keyCode === 13 && !part.multiline() ) e.preventDefault();
  })
  .on('dblclick', function(e) {
    part.dragmode(false);
  })
  .on('drop', function(e) {
    e.preventDefault();
  });
  
  var placeholder = part._placeholder = (function() {
    var node = $('<div class="ff-placeholder ff-acc"/>'), text, minWidthWrited = false;
    
    return {
      text: function(o) {
        if( !arguments.length ) return text;
        text = o;
        node.html(text);
        return this;
      },
      show: function() {
        if( !part.editmode() ) {
          this.hide();
          return this;
        }
        
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
        if( minWidthWrited ) dom.style.minWidth = '';
        
        node.remove();
        return this;
      }
    };
  })();
  
  placeholder.text(el.attr('placeholder') || ParagraphPart.placeholder || this.context().placeholder);
};

proto.multiline = function(b) {
  if( !('_multiline' in this) ) {
    this._multiline = $(this.dom()).attr('ff-multiline') == 'false' ? false : true;
  }
  
  if( !arguments.length ) return this._multiline;
  
  el.attr('ff-multiline', b === false ? false : null);
  this._multiline = !!b;
  return this;
};

proto.dragmode = function(b) {
  var el = $(this.dom());
  if( !arguments.length ) return el.ha('draggable');
  
  if( !this.editmode() ) return this;
  el.attr('draggable', b ? true : null).attr('contenteditable', b ? null : true);
  return this;
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

proto.onfocus = function(e) {
  if( !this.editmode() ) return;
  
  e.stopImmediatePropagation();
  
  var dom = this.dom();
  this.toolbar().show();
  this.placeholder().hide();
  $(dom).attr('draggable', null);
  
  dom.focus();
};

proto.onblur = function() {
  if( this.editmode() )
    this.placeholder().show();
};

proto.oneditmode = function(e) {
  $(this.dom()).attr('contenteditable', true).attr('draggable', null).ac('ff-paragraph');
  this.placeholder().show();
};

proto.onviewmode = function(e) {
  $(this.dom()).attr('contenteditable', null).attr('draggable', null).rc('ff-paragraph');
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

proto.createHistory = function() {
  var part = this;
  var dom = part.dom();
  
  return (function(html, cls, css) {
    return function() {
      dom.innerHTML = html || '';
      dom.className = cls || '';
      dom.style.cssText = css || '';
      part.focus();
    };
  })(dom.innerHTML, dom.className, dom.style.cssText);
};

module.exports = ParagraphPart;


