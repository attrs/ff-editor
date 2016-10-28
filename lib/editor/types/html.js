var xmodal = require('x-modal');
var Part = require('../part.js');

function getCaretPosition(editableDiv) {
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

function HTMLPart(el) {
  Part.call(this, el);
  
  var id = this.id;
  var part = this;
  var el = this.element;
  var original = el.innerHTML;
  
  part.toolbar().add({
    text: '<i class="fa fa-pencil"></i>',
    fn: function(e) {
      xmodal.open(require('../html/sourceeditor.html'), function(err, modal) {
        if( err ) return xmodal.error(err);
        
        var form = modal.body.querySelector('form');
        form.html.value = el.innerHTML || '';
        form.onsubmit = function(e) {
          e.preventDefault();
          el.innerHTML = part.data.html = form.html.value;
          modal.close();
        };
      });
    }
  });
  
  part.on('focus', function(e) {
    part.highlighter.hide();
    el.setAttribute('contenteditable', 'true');
    el.click();
  })
  .on('blur', function(e) {
    el.setAttribute('contenteditable', 'false');
    if( !part.data ) part.data = {};
    part.data.html = el.innerHTML;
  })
  .on('modechange', function(e) {
    if( !part.editmode ) 
      el.setAttribute('contenteditable', 'false');
  })
  .on('update', function(e) {
    //console.error('update', id, e.detail.prev, e.detail.data);
    el.innerHTML = (part.data && 'html' in part.data) ? part.data.html : original;
  })
  .on('click', function(e) {
    this.range = window.getSelection().getRangeAt(0);
  })
  .on('close', function() {
    //console.log('close', id);
    el.setAttribute('contenteditable', 'false');
    el.onkeyup = null;
  });
  
  el.onkeyup = function() {
    this.range = window.getSelection().getRangeAt(0);
  };
  
  if( part.data && 'html' in part.data ) {
    el.innerHTML = part.data.html;
  }
};

var tmp;
HTMLPart.prototype = Object.create(Part.prototype, {
  insert: {
    value: function(html) {
      if( !html ) return this;
      var range = this.range;
      var el = this.element;
      console.log('insert', range);
      
      if( !tmp ) tmp = document.createElement('div');
      tmp.innerHTML = html;
      
      [].forEach.call(tmp.childNodes || [], function(node) {
        if( range ) range.insertNode(node);
        else el.appendChild(node);
      });
      
      return this;
    }
  }
});

module.exports = HTMLPart;