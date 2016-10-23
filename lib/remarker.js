var getPosition = require('./position.js');

var highlighter, toolbar;
module.exports = function(part, emitter) {
  var el = part.element;
  var highlighter;
  var btns = ['config'];
  
  if( !toolbar ) {
    toolbar = document.createElement('div');
    toolbar.setAttribute('class', 'ff-toolbar');
    toolbar.style.position = 'absolute';
    toolbar.style.display = 'none';
    toolbar.style.zIndex = 101;
    toolbar.style.transition = 'all .25s';
    document.body.appendChild(toolbar);
  }
  
  var ul = document.createElement('ul');
  ul.className = 'ff-toolbar-actions';
  
  part
  .on('enter', function() {
    if( part.editmode ) handle.highlighter.show();
  })
  .on('leave', function() {
    handle.highlighter.hide();
  })
  .on('focus', function() {
    if( part.editmode ) handle.toolbar.show();
  })
  .on('reposition', function() {
    handle.highlighter.update();
    handle.toolbar.update();
  });
  
  var handle = {
    show: function() {
      handle.highlighter.show();
      return this;
    },
    hide: function() {
      handle.highlighter.hide();
      handle.toolbar.hide();
      return this;
    },
    toolbar: {
      update: function() {
        if( !btns.length ) return;
        
        ul.innerHTML = '';
        btns.forEach(function(btn) {
          if( !~['separator', 'config'].indexOf(btn) && !btn.text ) return;
          
          if( btn == 'separator' ) btn = {
            cls: 'separator'
          }
          
          if( btn == 'config' ) btn = {
            text: '<i class="fa fa-gear"></i>',
            fn: function() {
              part.config();
            }
          }
          
          var li = document.createElement('li');
          li.className = btn.cls || '';
          li.innerHTML = '<a>' + (btn.text || '<i class="fa fa-question"></i>') + '</a>';
          li.onclick = function(e) {
            e.stopImmediatePropagation();
            if( typeof btn.fn === 'function' ) btn.fn.apply(this, arguments);
          };
          
          ul.appendChild(li);
        });
        
        toolbar.innerHTML = '';
        toolbar.appendChild(ul);
        
        var position = getPosition(el);
        var top = position.top - toolbar.clientHeight - 8;
        var left = position.left + (el.clientWidth - toolbar.clientWidth) / 2;
        
        if( top <= 5 ) top = 5;
        
        toolbar.style.top = top + 'px';
        toolbar.style.left = left + 'px';
        return this;
      },
      show: function() {
        if( !btns.length ) return;
        console.log('toolbar show');
        toolbar.style.display = 'block';
        handle.toolbar.update();
        return this;
      },
      hide: function() {
        if( !btns.length ) return;
        console.log('toolbar hide');
        toolbar.style.display = 'none';
        return this;
      },
      buttons: {
        add: function(btn) {
          if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
          btns.push(btn);
          return this;
        },
        remove: function(btn) {
          if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
          return this;
        }
      }
    },
    highlighter: {
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
        handle.highlighter.update();
        return this;
      },
      hide: function() {
        if( highlighter ) {
          highlighter.style.opacity = 0;
          highlighter.style.display = 'none';
        }
        return this;
      }
    }
  };
  
  return handle;
};