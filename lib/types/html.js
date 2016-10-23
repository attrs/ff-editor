var xmodal = require('x-modal');

module.exports = function() {
  var id = this.id, part = this, el = this.element;
  var placeholder = document.createElement('div');
  placeholder.className = 'ff-placeholder';
  placeholder.style.display = 'none';
  el.setAttribute('contenteditable', 'false');
  
  part.remarker.toolbar.buttons.add({
    text: '<i class="fa fa-pencil"></i>',
    fn: function(e) {
      xmodal.open(require('../html/sourceeditor.html'), function(err, modal) {
        if( err ) return xmodal.error(err);
        
        var form = modal.body.querySelector('#form');
        form.onsubmit = function(e) {
          e.preventDefault();
          part.data.html = form.html.value;
        };
      });
    }
  }).add('config');
  
  part.on('focus', function(e) {
    //console.log('focus', id);
    part.remarker.highlighter.hide();
    el.setAttribute('contenteditable', 'true');
    el.click();
  })
  .on('blur', function(e) {
    //console.log('blur', id);
    el.setAttribute('contenteditable', 'false');
    part.data.html = el.innerHTML;
  })
  .on('modechange', function(e) {
    console.log('modechange', id, e);
    if( e.detail.editmode ) placeholder.style.display = 'block';
    else placeholder.style.display = 'none';
  })
  .on('update', function(e) {
    console.log('update', id, part.data);
    var html = part.data.html;
    if( html ) el.innerHTML = html;
    else el.appendChild(placeholder);
  })
  .on('close', function() {
    console.log('close', id);
    el.onkeyup = null;
  });
  
  el.onkeyup = function() {
    part.data.html = el.innerHTML;
  };
  
  var html = part.data.html;
  if( html ) el.innerHTML = html;
  else el.appendChild(placeholder);
};