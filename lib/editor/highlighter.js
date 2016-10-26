var getPosition = require('./position.js');

module.exports = function(el) {
  var highlighter;
  
  var instance = {
    update: function() {
      if( highlighter ) {
        var position = getPosition(el);
        highlighter.style.top = (position.top + 1) + 'px';
        highlighter.style.left = (position.left + 1) + 'px';
        highlighter.style.width = (el.clientWidth - 2) + 'px';
        highlighter.style.height = (el.clientHeight - 2) + 'px';
      }
      return this;
    },
    show: function() {
      if( !highlighter ) {
        highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'ff-highlighter');
        highlighter.style.position = 'absolute';
        highlighter.style.display = 'none';
        highlighter.style.cursor = 'pointer';
        highlighter.style.backgroundColor = 'rgba(0,0,0,0)';
        highlighter.style.border = '1px dotted rgba(128, 128, 128, 0.7)'
        highlighter.style.zIndex = 100;
        highlighter.style.opacity = 0;
        highlighter.style.top = highlighter.style.left = highlighter.style.width = highlighter.style.height = 0;
        highlighter.style.transition = 'opacity .25s';
      
        document.body.appendChild(highlighter);
      }
    
      highlighter.style.display = 'block';
      highlighter.style.opacity = 1;
      instance.update();
      return this;
    },
    hide: function() {
      if( highlighter ) {
        highlighter.style.opacity = 0;
        highlighter.style.display = 'none';
      }
      return this;
    }
  };
  
  return instance;
};