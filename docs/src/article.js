var ff = require('ff-editor');
var $ = require('tinyselector');
var Part = ff.Part;
var CustomPart = require('./custom/index.es6.js').default;
var tpls = require('./tpls/');
var version = 2;

ff.data(tpls['spongebob']);

if( +localStorage.getItem('ff-version') !== version )
  localStorage.removeItem('article');

// override alert/prompt/imageshow action
(function() {
  var PhotoSwipe = require('photoswipe');
  var PhotoSwipeDefaultUI = require('photoswipe/dist/photoswipe-ui-default.js');
  var slidetpl = $(require('./slidetpl.html'));
  require('photoswipe/dist/photoswipe.css');
  require('photoswipe/dist/default-skin/default-skin.css');
  
  var swal = require('sweetalert');
  require('sweetalert/dist/sweetalert.css');
  
  ff.on('ff-alert', function(e) {
    e.preventDefault();
    swal(e.detail.message);
  })
  .on('ff-error', function(e) {
    e.preventDefault();
    swal('Error', e.detail.error.message, 'error');
  })
  .on('ff-prompt', function(e) {
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
  .on('ff-imageshow', function(e) {
    e.preventDefault();
    
    var image = e.detail.image;
    var images = $('#content img');
    var index = images.index(image);
    var items = [];
    
    if( ~index ) {
      images.each(function() {
        var img = this;
        items.push({
          src: img.src,
          w: img.naturalWidth,
          h: img.naturalHeight
        });
      });
    } else {
      index = 0;
      items.push({
        src: image.src,
        w: image.naturalWidth,
        h: image.naturalHeight
      });
    }
    
    new PhotoSwipe(slidetpl.appendTo(document.body)[0], PhotoSwipeDefaultUI, items, {
      index: index,
      bgOpacity: 0.95
    }).init();
  });
  
  
  // set default font & colors
  ff.fonts().add([
    { text:'<span style="font-family: Roboto;">Roboto</span>', font: 'Roboto' },
    { text:'<span style="font-family: NotoSansKR;">Noto Sans</span>', font: 'NotoSansKR' },
    { text:'<span style="font-family: Nanum Gothic;">나눔고딕</span>', font: 'Nanum Gothic' },
    { text:'<span style="font-family: NanumBarunGothic;">나눔바른고딕</span>', font: 'NanumBarunGothic' },
    { text:'<span style="font-family: Nanum Myeongjo;">나눔명조</span>', font: 'Nanum Myeongjo' }
  ]);
  
  ff.colors().add({ text:'<span style="color: #E9573F;">Text Color</span>', color: '#E9573F' });

  ff.fonts().get('default').text = '기본 폰트';
  ff.colors().get('default').text = '기본 글자색';
})();

// modify buttons
(function() {
  // remove common clearfix button
  ff.Part.toolbar.remove('clearfix');
  
  // add common button
  ff.Part.toolbar = [
    {
      id: 'test',
      text: '<i class="fa fa-gear"></i>',
      fn: function() {
        alert('test');
      }
    },
    ff.tools.remove
  ];
  
  // reset part buttons
  ff.Heading.toolbar = [ff.tools.clearfix, '-', ff.tools.remove];
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
  ff.on('ff-modechange', function(e) {
    $('#modebtn').html(e.detail.editmode ? 'View Mode' : 'Edit Mode');
  });
  
  window.create = function() {
    ff.clear().editmode(true);
  };
  
  window.toggleMode = function() {
    ff.editmode(!ff.editmode());
  };
  
  window.load = function() {
    var saved = JSON.parse(localStorage.getItem('article') || '{}');
    $('#title').html(saved && saved.title && saved.title.html);
    $('#content').html(saved && saved.content && saved.content.html);
  };
  
  window.save = function() {
    var data = ff.data();
    
    localStorage.setItem('article', JSON.stringify(data));
    localStorage.setItem('ff-version', version);
    
    var html = data && data.content && data.content.html;
    var el = $('<div style="max-height:300px;overflow:auto;text-align:left;font-size:12px;border:1px solid #eee;">').text(html);
    
    swal({
      title: 'Saved!',
      text: el.outer(),
      html: true,
      type: 'success'
    });
  };
  
  window.preset = function(name) {
    ff.data(tpls[name]);
  };
  
  if( localStorage.getItem('article') ) window.load();
});
