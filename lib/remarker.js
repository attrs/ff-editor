var getPosition = require('./position.js');

var highlighter, toolbar;
module.exports = function(part) {
  var el = part.element();
  
  if( !toolbar ) {
    toolbar = document.createElement('div');
    toolbar.setAttribute('class', 'ff-toolbar');
    toolbar.style.position = 'absolute';
    toolbar.style.display = 'none';
    toolbar.style.zIndex = 101;
    toolbar.style.transition = 'all .25s';
    toolbar.innerHTML = require('./html/toolbar.html');
    document.body.appendChild(toolbar);
  }
  
  if( !highlighter ) {
    highlighter = document.createElement('div');
    highlighter.setAttribute('class', 'ff-highlighter');
    highlighter.style.position = 'absolute';
    highlighter.style.backgroundColor = 'rgba(0,0,0,0)';
    highlighter.style.border = '2px dotted rgba(128, 128, 128, 0.7)'
    highlighter.style.zIndex = 100;
    highlighter.style.top = highlighter.style.left = highlighter.style.width = highlighter.style.height = 0;
    highlighter.style.transition = 'all .25s';
    document.body.appendChild(highlighter);
  }
  
  var position = getPosition(el);
  highlighter.style.top = position.top + 'px';
  highlighter.style.left = position.left + 'px';
  highlighter.style.width = el.clientWidth + 'px';
  highlighter.style.height = el.clientHeight + 'px';
  
  highlighter.onclick = function() {
    var position = getPosition(el);
    toolbar.style.display = 'block';
    toolbar.style.top = position.top - toolbar.clientHeight - 5 + 'px';
    toolbar.style.left = (position.left + (el.clientWidth - toolbar.clientWidth) / 2) + 'px';
  };
  
  return {
    toolbar: {
      show: function() {
        
      },
      hide: function() {
        
      },
      buttons: {
        add: function(btn) {
          
        },
        remove: function(btn) {
          
        }
      }
    },
    highlighter: {
      show: function() {
        
      },
      hide: function() {
        
      }
    }
  };
};