var $ = require('tinyselector');
var win = window;
var doc = document;

function nextnode(node, skip){
  if( node.firstChild && !skip ) return node.firstChild;
  if( !node.parentNode ) return null;
  
  return node.nextSibling || nextnode(node.parentNode, true);
}

function rangelist(range){
  var start = range.startContainer.childNodes[range.startOffset] || range.startContainer;
  var end = range.endContainer.childNodes[range.endOffset] || range.endContainer;
  
  if( start === end ) return [start];
  
  var nodes = [], current = start;
  do {
    nodes.push(current);
  } while ((current = nextnode(current)) && (current != end));
  
  return nodes;
}

function wrap(range, selector) {
  if( !range ) return null;
  if( typeof selector != 'string' || !selector ) selector = 'div';
  
  var node = range.cloneContents();
  var asm = $.util.assemble(selector);
  var wrapper = doc.createElement(asm.tag);
  if( asm.id ) wrapper.id = id;
  if( asm.classes ) wrapper.className = asm.classes;
  
  wrapper.appendChild(node);
  wrapper.normalize();
  range.deleteContents();
  range.insertNode(wrapper);
  
  // select new node
  var range = doc.createRange();
  range.selectNodeContents(wrapper);
  var selection = win.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  return wrapper;
};

function unwrap(range, selector) {
  if( !range || !selector ) return this;
  
  var common = $(range.commonAncestorContainer);
  var node = range.cloneContents();
  var tmp = $('<div/>').append(node);
  
  //console.log('tmp', tmp.html());
  tmp.nodes().each(function() {
    var el = $(this);
    
    el.find(selector).nodes().unwrap();
    if( el.is(selector) ) el.nodes().unwrap();
  });
  
  var nodes = tmp.normalize().nodes();
  //console.log('nodes', tmp.html());
  if( !nodes.length ) return this;
  
  var start = nodes[0];
  var end = nodes[nodes.length - 1];
  
  range.deleteContents();
  
  nodes.reverse().each(function() {
    range.insertNode(this);
  });
  
  range = doc.createRange();
  range.selectNodeContents(start);
  var startoffset = range.startOffset;
  
  range = doc.createRange();
  range.selectNodeContents(end);
  var endoffset = range.endOffset;
  
  range = doc.createRange();
  range.setStart(start, startoffset);
  range.setEnd(end, endoffset);
  
  var selection = win.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  start.parentNode.normalize();
  
  return this;
};

function iswrapped(range, selector) {
  if( !range ) return false;
  
  var wrapped = false;
  $(rangelist(range)).each(function() {
    if( wrapped ) return false;
    var el = $(this);
    wrapped = el.is(selector) || el.parent(selector).length || el.find(selector).length;
  });
  
  return wrapped;
};

function togglewrap(range, selector) {
  if( !range ) return this;
  if( iswrapped(range, selector) ) unwrap(range, selector);
  else wrap(range, selector);
  
  return this;
};

function RangeEditor(range) {
  return {
    range: function() {
      return range;
    },
    iswrapped: function(selector) {
      return iswrapped(range, selector);
    },
    togglewrap: function(selector) {
      return togglewrap(range, selector);
    },
    unwrap: function(selector) {
      return unwrap(range, selector);
    },
    wrap: function(selector) {
      return wrap(range, selector);
    }
  };
}

module.exports = RangeEditor;