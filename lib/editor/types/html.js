var xmodal = require('x-modal');
var Part = require('../part.js');

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
    console.error('update', id, e.detail.prev, e.detail.data);
    el.innerHTML = (part.data && 'html' in part.data) ? part.data.html : original;
  })
  .on('close', function() {
    console.log('close', id);
    el.setAttribute('contenteditable', 'false');
    el.onkeyup = null;
  });
  
  if( part.data && 'html' in part.data ) {
    el.innerHTML = part.data.html;
  }
};

HTMLPart.prototype = Object.create(Part.prototype);

module.exports = HTMLPart;