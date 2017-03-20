var ff = require('firefront');
var $ = require('jquery');
var bootstrap = require('bootstrap');
var Part = ff.Part;
var CustomPart = require('./custom/').default;

ff.editmode(true).ready(function() {
  var article = Part($('#article')[0]);
  
  console.log('Ready!', article);
  
  window.editmode = function() {
    
  };
  
  window.viewmode = function() {
    
  };
  
  window.reload = function() {
    
  };
  
  window.save = function() {
    
  };
  
  window.load = function(tpl) {
    
  };
});