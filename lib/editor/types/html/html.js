var xmodal = require('x-modal');
var Part = require('../../part.js');

function anchorPrevent(e) {
  e.preventDefault();
  e.stopPropagation();
}

function HTMLPart(el) {
  Part.call(this, el);
  
  var part = this;
  var defaults = this._defaults = {
    style: el.getAttribute('style'),
    cls: el.className,
    html: el.innerHTML
  };
  var prevented = [];
  
  this.highlighter().enable(false);
  
  part
  .on('modechange', function(e) {
    if( !this.editmode() ) {
      el.removeAttribute('contenteditable');
      
      prevented.forEach(function(node) {
        node.removeEventListener('click', anchorPrevent);
      });
      prevented = [];
    } else {
      el.setAttribute('contenteditable', 'true');
      
      [].forEach.call(el.querySelectorAll('[href]'), function(node) {
        node.addEventListener('click', anchorPrevent);
        prevented.push(node);
      });
    }
  })
  .on('update', function() {
    var data = this.data();
    
    if( data.cls ) {
      var cls = (ocls || '').trim().split(' ');
      data.cls.split(' ').forEach(function(c) {
        if( c ) cls.push(c);
      });
      el.className = cls.join(' ');
    }
    
    if( data.style ) {
      var style = (ostyle || '').trim().split(';');
      data.style.split(' ').forEach(function(c) {
        if( c ) style.push(c);
      });
      
      el.style = style.join(';');
    }
    
    if( data.html ) {
      el.innerHTML = data.html;
    } else {
      el.innerHTML = this.defaults().html;
    }
  })
  .on('close', function() {
    el.removeAttribute('contenteditable');
  })
  .on('blur', function() {
    this.data().html = el.innerHTML;
  });
  
  this.toolbar().first({
    text: '<i class="fa fa-gear"></i>',
    fn: function(e) {
      this.owner().config();
    }
  });
};

HTMLPart.prototype = new Part;

HTMLPart.prototype.defaults = function() {
  if( !arguments.length ) return this._defaults;
};

HTMLPart.prototype.restoreDefaults = function() {
  var defaults = this._defaults;
  var el = this.element();
  if( defaults ) {
    if( defaults.style ) el.setAttribute('style', defaults.style);
    else el.removeAttribute('style');
    
    if( defaults.cls ) el.setAttribute('class', defaults.cls);
    else el.removeAttribute('class');
    
    el.innerHTML = defaults.html || '';
  }
  return this;
};

HTMLPart.prototype.config = function() {
  var part = this;
  var el = this.element();
  
  xmodal.open(require('./config.html'), function(err, modal) {
    if( err ) return xmodal.error(err);
    
    var data = part.data();
    var form = modal.body.querySelector('form');
    if( data && data.style ) form.style.value = data && data.style;
    if( data && data.cls ) form.cls.value = data && data.cls;
    form.html.value = el.innerHTML || '';
    
    form.onsubmit = function(e) {
      e.preventDefault();
      
      data = data || {};
      if( form.style.value ) data.style = form.style.value;
      else delete data.style;
      
      if( form.cls.value ) data.cls = form.cls.value;
      else delete data.cls;
      
      if( form.html.value ) data.html = form.html.value;
      else delete data.html;
      
      part.data(data);
      modal.close();
    };
  });
  return this;
};

module.exports = HTMLPart;