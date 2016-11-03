var getPosition = require('./position.js');

function clone(o) {
  var result = {};
  for(var k in o) result[k] = o[k];
  return result; 
}

function Toolbar(owner, options) {
  if( !owner || typeof owner.element !== 'function' ) throw new TypeError('illegal owner(owner.element() requried)');
  options = clone(options);
  
  var toolbar = document.createElement('div');
  var buttonul = document.createElement('ul');
  buttonul.className = 'ff-toolbar-actions';
  toolbar.appendChild(buttonul);
  
  var btns = [], visible = false;
  
  var instance = {
    options: function(o) {
      if( !arguments.length ) return options;
      options = clone(options || o);
      return this;
    },
    position: function(position) {
      options.position = position;
      instance.update();
      return this;
    },
    element: function() {
      return toolbar;
    },
    owner: function() {
      return owner;
    },
    update: function() {
      if( !btns.length ) return;
      if( !visible ) {
        toolbar.style.display = 'none';
        return;
      }
      
      buttonul.innerHTML = '';
      btns.forEach(function(btn) {
        if( !btn ) return;
        
        var li = document.createElement('li');
        var scope = {
          toolbar: function() {
            return instance;
          },
          owner: function() {
            return owner;
          },
          text: function(text) {
            if( !arguments.length ) return btn.text;
            btn.text = text || '';
            li.innerHTML = '<a>' + btn.text + '</a>';
            return this;
          }
        };
        
        if( btn.separator ) {
          li.className = (btn.cls || '') + ' ff-separator';
        } else {
          li.className = (btn.cls || '') + ' ff-toolbar-btn';
          li.innerHTML = '<a>' + (btn.text || '') + '</a>';
          li.onclick = function(e) {
            e.stopImmediatePropagation();
            if( typeof btn.fn === 'function' ) btn.fn.call(scope, e);
            instance.update();
          };
        }
        
        if( typeof btn.show === 'function' ) {
          if( btn.show.call(scope) ) buttonul.appendChild(li);
        } else {
          buttonul.appendChild(li);
        }
      });
      
      toolbar.className = 'ff-toolbar';
      toolbar.style.position = options.fixed ? 'fixed' : 'absolute';
      toolbar.style.display = '';
      toolbar.style.zIndex = options.zIndex || 110;
      toolbar.style.transition = 'all .25s';
      if( options.cls ) toolbar.className += ' ' + options.cls;
      if( options.style ) toolbar.setAttribute('style', options.style);
      
      document.body && document.body.appendChild(toolbar);
      
      var ownerElement = owner.element();
      if( options.position && ownerElement ) {
        var ownerposition = getPosition(ownerElement);
        var position = options.position || 'top center outside';
        var posarr = position.split(' ');
        var inside = ~posarr.indexOf('inside');
        var vertical = ~posarr.indexOf('vertical');
        var nomargin = ~posarr.indexOf('nomargin');
        if( vertical ) toolbar.className += ' ff-toolbar-vertical';
        
        var width = ownerElement.clientWidth;
        var height = ownerElement.clientHeight;
        var tbarwidth = toolbar.clientWidth;
        var tbarheight = toolbar.clientHeight;
        var top = 0, left = 0, margin = nomargin ? 0 : (+options.margin || 10);
        
        posarr.forEach(function(pos) {
          if( !vertical ) {
            if( pos === 'top' ) {
              if( inside ) top = ownerposition.top + margin;
              else top = ownerposition.top - tbarheight - margin;
            } else if( pos == 'bottom' ) {
              if( inside ) top = ownerposition.top + height - tbarheight - margin;
              else top = ownerposition.top + height + margin;
            } else if( pos == 'left' ) {
              left = ownerposition.left;
              if( inside ) left += margin;
            } else if( pos == 'center' ) {
              left = ownerposition.left + (width - tbarwidth) / 2;
            } else if( pos == 'right' ) {
              left = ownerposition.left + width - tbarwidth;
              if( inside ) left -= margin;
            }
          } else {
            if( pos === 'top' ) {
              top = ownerposition.top;
              if( inside ) top += margin;
            } else if( pos == 'middle' ) {
              top = ownerposition.top + (height - tbarheight) / 2;
            } else if( pos == 'bottom' ) {
              top = ownerposition.top + height - tbarheight;
              if( inside ) top -= margin;
            } else if( pos == 'left' ) {
              if( inside ) left = ownerposition.left + margin;
              else left = ownerposition.left - tbarwidth - margin;
            } else if( pos == 'right' ) {
              if( inside ) left = ownerposition.left + width - tbarwidth - margin;
              else left = ownerposition.left + width + margin;
            }
          }
        });
        
        if( top <= 5 ) top = 5;
        if( left <= 5 ) left = 5;
        toolbar.style.top = top + 'px';
        toolbar.style.left = left + 'px';
      }
      
      if( +options.top >= 0 ) toolbar.style.top = options.top + 'px';
      if( +options.bottom >= 0 ) toolbar.style.bottom = options.bottom + 'px';
      if( +options.left >= 0 ) toolbar.style.left = options.left + 'px';
      if( +options.right >= 0 ) toolbar.style.right = options.right + 'px';
      
      return this;
    },
    show: function() {
      if( !btns.length ) return;
      visible = true;
      instance.update();
      return this;
    },
    hide: function() {
      if( !btns.length ) return;
      visible = false;
      instance.update();
      return this;
    },
    clear: function() {
      btns = [];
      instance.update();
      return this;
    },
    buttons: function(arr) {
      if( !Array.isArray(arr) ) throw new TypeError('Argument buttons must be an array');
      btns = arr.slice();
      instance.update();
      return this;
    },
    add: function(btn) {
      if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
      btns.push(btn);
      instance.update();
      return this;
    },
    remove: function(btn) {
      if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
      instance.update();
      return this;
    }
  };
  
  return instance;
}


module.exports = Toolbar;
