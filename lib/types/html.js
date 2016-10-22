var xmodal = require('x-modal');

module.exports = function HTMLPart() {
  var part = this, el = el;
  var placeholder = document.createElement('div');
  placeholder.className = 'ff-placeholder';
  placeholder.style.display = 'none';
  
  this.toolbar.buttons.add({
    text: '<i class="fa fa-pencil"></i>',
    fn: function(e) {
      xmodal.open(require('./editor.html'), function(err, modal) {
        if( err ) return xmodal.error(err);
        
        var form = modal.body.querySelector('#form');
        form.onsubmit = function(e) {
          e.preventDefault();
          part.data.html = form.html.value;
        };
      });
    }
  }).add('config');
  
  this.on('focus', function(e) {
    el.setAttribute('contenteditable', 'true');
    this.remarker.hide();
  })
  .on('modechange', function(e) {
    if( e.detail.editmode ) placeholder.style.display = 'block';
    else placeholder.style.display = 'none';
  })
  .on('blur', function(e) {
    el.setAttribute('contenteditable', 'true');
  })
  .on('update', function(e) {
    var html = this.data.html;
    if( html ) el.innerHTML = html;
    else el.appendChild(placeholder);
  })
  .on('close', function() {
    el.onkeyup = null;
  });
  
  el.onkeyup = function() {
    this.data.html = el.innerHTML;
  };
  
  var html = this.data.html;
  if( html ) el.innerHTML = html;
  else el.appendChild(placeholder);
};