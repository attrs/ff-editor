var getPosition = require('./position.js');

function Toolbar(options) {
  options = options || {};
  
  var fixed = options.fixed;
  var scope = options.scope || {};
  var cls = options.cls;
  var style = options.style;
  var zIndex = options.zIndex || 110;
  var top = options.top;
  var bottom = options.bottom;
  var left = options.left;
  var right = options.right;
  var target = options.target;
  
  var toolbar = document.createElement('div');
  toolbar.className = 'ff-toolbar';
  if( cls ) toolbar.className += ' ' + cls;
  if( style ) toolbar.setAttribute('style', style);
  if( +top >= 0 ) toolbar.style.top = top + 'px';
  if( +bottom >= 0 ) toolbar.style.bottom = bottom + 'px';
  if( +left >= 0 ) toolbar.style.left = left + 'px';
  if( +right >= 0 ) toolbar.style.right = right + 'px';
  
  toolbar.style.position = fixed ? 'fixed' : 'absolute';
  toolbar.style.display = 'none';
  toolbar.style.zIndex = zIndex;
  toolbar.style.transition = 'all .25s';
  
  var buttons = document.createElement('ul');
  buttons.className = 'ff-toolbar-actions';
  toolbar.appendChild(buttons);
  
  var btns = [];
  
  var instance = {
    get element() {
      return toolbar;
    },
    update: function(position) {
      if( !btns.length ) return;
      
      buttons.innerHTML = '';
      btns.forEach(function(btn) {
        if( !btn ) return;
        
        var li = document.createElement('li');
        if( btn.separator ) {
          li.className = (btn.cls || '') + ' ff-separator';
        } else {
          li.className = (btn.cls || '') + ' ff-btn';
          li.innerHTML = '<a>' + (btn.text || '') + '</a>';
          li.onclick = function(e) {
            e.stopImmediatePropagation();
            if( typeof btn.fn === 'function' ) btn.fn.call(scope, e);
          };
        }
        
        buttons.appendChild(li);
      });
      
      if( target ) {
        var p = getPosition(target);
        toolbar.style.top = p.top - toolbar.clientHeight - 8 + 'px';
        toolbar.style.left = p.left + (target.clientWidth - toolbar.clientWidth) / 2 + 'px';
      }
      
      if( position ) {
        if( +position.top >= 0 ) toolbar.style.top = position.top + 'px';
        if( +position.bottom >= 0 ) toolbar.style.bottom = position.bottom + 'px';
        if( +position.left >= 0 ) toolbar.style.left = position.left + 'px';
        if( +position.right >= 0 ) toolbar.style.right = position.right + 'px';
      }
      
      return this;
    },
    show: function(position) {
      if( !btns.length ) return;
      toolbar.style.display = 'block';
      instance.update(position);
      toolbar.style.opacity = 1;
      return this;
    },
    hide: function() {
      if( !btns.length ) return;
      toolbar.style.display = 'none';
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
