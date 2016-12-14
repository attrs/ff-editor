var Part = require('../part.js');

function TextPart(el) {
  Part.call(this, el);
  
  var id = this.id();
  var part = this;
  var el = this.element();
  
  part.toolbar().clear();
  
  part
  .on('render', function(e) {
    var data = this.data();
    var editmode = this.editmode();
    
    if( data && 'html' in data ) {
      el.innerHTML = data.html || '';
    } else {
      this.restoreDefaults();
    }
    
    if( editmode && !el.children.length ) {
      //el.innerHTML = '<span class="text-muted">내용을 입력해주세요</span>';
    }
  })
  .on('click', function(e) {
    if( this.editmode() ) {
      el.setAttribute('contenteditable', 'true');
      this.highlighter().hide();
      el.click();
    }
  })
  .on('modechange', function(e) {
    if( !e.detail.editmode ) {
      el.setAttribute('contenteditable', 'false');
    } else {
      this.highlighter().hide();
      el.setAttribute('contenteditable', 'true');
    }
  })
  .on('close', function() {
    el.setAttribute('contenteditable', 'false');
  });
};

TextPart.prototype = new Part;

module.exports = TextPart;