var ff = require('firefront');
var $ = require('tinyselector');
var Part = ff.Part;
var CustomPart = require('./custom/index.es6.js').default;
var tpls = require('./tpls/');

ff.ready(function() {
  $('.dropdown').on('click', function() {
    $(this).tc('open');
  });
  
  window.toggleMode = function(el) {
    var editmode = ff.editmode();
    if( editmode ) ff.editmode(false);
    else ff.editmode(true);
    
    if( el ) {
      if( editmode ) el.innerHTML = 'Edit Mode';
      else el.innerHTML = 'View Mode';
    }
  };
  
  window.load = function() {
    ff.data(JSON.parse(localStorage.getItem('article') || '{}'));
  };
  
  window.save = function() {
    localStorage.setItem('article', JSON.stringify(ff.data()));
  };
  
  window.preset = function(name) {
    ff.data(tpls[name]);
  };
  
  if( localStorage.getItem('article') ) window.load();
  else window.preset('spongebob');
});
