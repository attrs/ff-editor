var xmodal = require('x-modal');
var Part = require('../part.js');

function HTMLPart(el) {
  Part.call(this, el);
  
  var id = this.id();
  var part = this;
  var el = this.element();
  var lasthtml;
  
  part.toolbar().add({
    text: '<i class="fa fa-pencil"></i>',
    fn: function(e) {
      xmodal.open(require('../html/sourceeditor.html'), function(err, modal) {
        if( err ) return xmodal.error(err);
        
        var form = modal.body.querySelector('form');
        form.html.value = el.innerHTML || '';
        form.onsubmit = function(e) {
          e.preventDefault();
          
          var data = part.data() || {};
          
          if( form.html.value ) data.html = form.html.value;
          else delete data.html;
          
          part.data(data);
          modal.close();
        };
      });
    }
  }, 0);
  
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
  .on('blur', function(e) {
    el.setAttribute('contenteditable', 'false');
  })
  .on('modechange', function(e) {
    if( !this.editmode() )
      el.setAttribute('contenteditable', 'false');
  })
  .on('close', function() {
    el.setAttribute('contenteditable', 'false');
  })
  .on('keyup', function(e) {
    lasthtml = lasthtml || el.innerHTML;
    
    if( this.editmode() ) {
      var data = this.data();
      var datahtml = (data && data.html) || '';
      var chtml = el.innerHTML;
      
      if( chtml !== lasthtml ) {
        lasthtml = chtml;
        
        var newdata = {};
        for(var k in data) newdata[k] = data[k];
        newdata.html = chtml;
        
        this.data(newdata, false);
      }
    }
  });
};

HTMLPart.prototype = new Part;

module.exports = HTMLPart;