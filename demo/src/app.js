var ff = require('firefront');
var $ = require('tinyselector');
var Part = ff.Part;
var CustomPart = require('./custom/').default;

ff.ready(function() {
  console.log('Ready!');
  
  $('.dropdown').on('click', function() {
    $(this).tc('open');
  });
  
  var article = Part(document.getElementById('article'));
  
  window.toggleMode = function(el) {
    var editmode = ff.editmode();
    if( editmode ) ff.editmode(false);
    else ff.editmode(true);
    
    if( el ) {
      if( editmode ) el.innerHTML = 'Edit Mode';
      else el.innerHTML = 'View Mode';
    }
  };
  
  window.reload = function() {
    
  };
  
  window.save = function() {
    console.log('html', article.html());
  };
  
  window.load = function(tpl) {
    
  };
});
