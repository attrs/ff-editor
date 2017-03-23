var ff = require('ff-editor');
var $ = require('tinyselector');
var Part = ff.Part;
var CustomPart = require('./custom/index.es6.js').default;
var tpls = require('./tpls/');

// override alert/prompt/imageshow action
(function() {
  var PhotoSwipe = require('photoswipe');
  var PhotoSwipeDefaultUI = require('photoswipe/dist/photoswipe-ui-default.js');
  var swal = require('sweetalert');
  require('photoswipe/dist/photoswipe.css');
  require('photoswipe/dist/default-skin/default-skin.css');
  require('sweetalert/dist/sweetalert.css');
  
  var pwspel = $(require('./pwsp.html'));
  
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
  })
  .on('imageshow', function(e) {
    e.preventDefault();
    var items = [
      {
        src: e.detail.src,
        w: e.detail.image.naturalWidth,
        h: e.detail.image.naturalHeight
      }
    ];
    
    new PhotoSwipe(pwspel.appendTo(document.body)[0], PhotoSwipeDefaultUI, items, {
      index: 0
    }).init();
  });
})();

// init gnb dropdown
$(document).ready(function($) {
  $('.dropdown').on('click', function() {
    $(this).tc('open');
  }).parent('body').on('click', function(e) {
    var target = $(e.target);
    if( !target.is('.dropdown') && !target.parent('.dropdown').length )
      $('.dropdown').rc('open');
  }, true);
});

// ready
ff.ready(function() {
  // change button label when modechange
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
