var ff = require('ff-editor');
var $ = require('tinyselector');
var Part = ff.Part;
var CustomPart = require('./custom/index.es6.js').default;
var tpls = require('./tpls/');

// override alert/prompt action
(function() {
  var swal = require('sweetalert');
  require('sweetalert/dist/sweetalert.css');

  ff.on('alert', function(e) {
    e.preventDefault();
    swal(e.detail.message);
  })
  .on('error', function(e) {
    e.preventDefault();
    swal('Error', e.detail.error.message, 'error');
  })
  .on('prompt', function(e) {
    e.preventDefault();
    swal({
      title: e.detail.message,
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: true
    }, function(value) {
      if( value === false ) return;
      e.detail.callback(value);
    });
  });
})();

// init gnb dropdown
$(document).ready(function($) {
  $('.dropdown').on('click', function() {
    $(this).tc('open');
  });
});

// ready
ff.ready(function() {
  ff.on('modechange', function(e) {
    $('#modebtn').html(e.detail.editmode ? 'View Mode' : 'Edit Mode');
  });
  
  window.create = function() {
    ff.data(null).editmode(true);
  };
  
  window.toggleMode = function() {
    ff.editmode(!ff.editmode());
  };
  
  window.load = function() {
    ff.data(JSON.parse(localStorage.getItem('article') || '{}')).editmode(false);
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