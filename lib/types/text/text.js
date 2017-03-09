var modal = require('tinymodal');
var $ = require('tinyselector');
var Part = require('../../part.js');

function anchorPrevent(e) {
  e.preventDefault();
  e.stopPropagation();
}

function TextPart(el) {
  Part.call(this, el);
  
  var prevented = [];
  
  this.highlighter().enable(false);
  
  this.toolbar().first({
    text: '<i class="fa fa-gear"></i>',
    fn: function(e) {
      this.owner().config();
    }
  });
};


TextPart.prototype = Object.create(Part.prototype, {
  oninit: {
    value: function(e) {
      var el = this.dom();
      this._defaults = {
        style: el.getAttribute('style'),
        cls: el.className,
        html: el.innerHTML
      };
    }
  },
  onmodechange: {
    value: function(e) {
      var el = this.dom();
      
      if( this.editmode() ) {
        el.setAttribute('contenteditable', 'true');
        $(el).find('[href]').on('click', anchorPrevent);
      } else {
        el.removeAttribute('contenteditable');
        $(el).find('[href]').off('click', anchorPrevent);
      }
    }
  },
  setData: {
    value: function(data) {
      if( data && data.html ) this.dom().innerHTML = data.html;
      return this;
    }
  },
  getData: {
    value: function() {
      return {
        html:this.dom().innerHTML
      };
    }
  },
  defaults: {
    value: function() {
      if( !arguments.length ) return this._defaults;
    }
  },
  restoreDefaults: {
    value: function() {
      var defaults = this._defaults;
      var el = this.dom();
      if( defaults ) {
        if( defaults.style ) el.setAttribute('style', defaults.style);
        else el.removeAttribute('style');
        
        if( defaults.cls ) el.setAttribute('class', defaults.cls);
        else el.removeAttribute('class');
        
        el.innerHTML = defaults.html || '';
      }
      return this;
    }
  },
  config: {
    value: function() {
      var part = this;
      var el = this.dom();
      
      modal.open(require('./config.html'), function(err, modal) {
        if( err ) return console.error(err);
        
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
    }
  }
});


module.exports = TextPart;