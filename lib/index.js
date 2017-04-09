var win = window,
    doc = document,
    ctx = require('./context.js'),
    Toolbar = require('./toolbar/'),
    Part = require('./part.js'),
    Items = require('./items.js')
    $ = require('tinyselector');

require('./less/index.less');

ctx.Part = Part;
ctx.Toolbar = Toolbar;
ctx.Items = Items;

var ArticlePart = require('./types/article/article.js');
var ParagraphPart = require('./types/paragraph/paragraph.js');
var SeparatorPart = require('./types/separator/separator.js');
var ImagePart = require('./types/image/image.js');
var VideoPart = require('./types/video/video.js');
var RowPart = require('./types/row/row.js');
var LinkPart = require('./types/link/link.js');
var TextPart = require('./types/text/text.js');
var HeadingPart = require('./types/heading/heading.js');

ctx.Article = ArticlePart;
ctx.Paragraph = ParagraphPart;
ctx.Separator = SeparatorPart;
ctx.Image = ImagePart;
ctx.Video = VideoPart;
ctx.Row = RowPart;
ctx.Link = LinkPart;
ctx.Text = TextPart;
ctx.Heading = HeadingPart;

ctx.type('default', ParagraphPart);
ctx.type('article', ArticlePart);
ctx.type('paragraph', ParagraphPart);
ctx.type('text', TextPart);
ctx.type('separator', SeparatorPart);
ctx.type('image', ImagePart);
ctx.type('video', VideoPart);
ctx.type('row', RowPart);
ctx.type('link', LinkPart);
ctx.type('heading', HeadingPart);

ctx.fonts([
  {id: 'default', text:'Default Font'},
  {id: 'helvetica', text:'<span style="font-family: Helvetica;">Helvetica</span>', font: 'Helvetica'},
  {id: 'times', text:'<span style="font-family: Times New Roman;">Times New Roman</span>', font: 'Times New Roman'},
  {id: 'courier', text:'<span style="font-family: Courier New;">Courier New</span>', font: 'Courier New'}
]);

ctx.colors([
  {id: 'default', text:'Default Color'},
  {id: 'primary', text:'<span style="color: #3498db;">Text Color</span>', color: '#3498db'},
  {id: 'info', text:'<span style="color: #3bafda;">Text Color</span>', color: '#3bafda'},
  {id: 'danger', text:'<span style="color: #e9573f;">Text Color</span>', color: '#e9573f'},
  {id: 'warning', text:'<span style="color: #f6bb42;">Text Color</span>', color: '#f6bb42'},
  {id: 'success', text:'<span style="color: #70AB4F;">Text Color</span>', color: '#70AB4F'},
  {id: 'dark', text:'<span style="color: #3b3f4f;">Text Color</span>', color: '#3b3f4f'},
  {id: 'system', text:'<span style="color: #6E5DA8;">Text Color</span>', color: '#6E5DA8'}
]);

ctx.uploader(function(file, done) {
  if( !window.FileReader ) return done(new Error('use context.uploader(fn) to set up your custom uploader'));
  
  var reader = new FileReader(); // NOTE: IE10+
  reader.onload = function(e) {
    done(null, {
      src: e.target.result,
      name: file.name
    });
  };
  reader.onerror = function(err) {
    done(err);
  };
  reader.readAsDataURL(file);
});

ctx.placeholder = 'Please enter the text.';

module.exports = ctx;


(function() {
  var readyfn;
  
  doc.addEventListener('DOMContentLoaded', function() {
    ctx.scan();
    readyfn && readyfn();
    
    /*if( window.MutationObserver ) {
      var observer = new MutationObserver(function(mutations) {
        console.log('scan');
        ctx.scan();
      });
    
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }*/
  });

  ctx.ready = function(fn) {
    if( doc.body ) fn();
    else readyfn = fn;
  };
  
  // bind undo/redo shortcut listener
  var platform = win.navigator.platform;
  var mac = !!~platform.toLowerCase().indexOf('mac');
  var history = ctx.history();
  
  $(win).on('keydown', function(e) {
    if( !ctx.editmode() ) return;
  
    if( mac ) {
      if( e.metaKey && e.key == 'z' ) history.undo();
      else if( e.metaKey && e.shiftKey && e.key == 'Z' ) history.redo();
      else return;
    } else {
      if( e.ctrlKey && e.key == 'z' ) history.undo();
      else if( e.ctrlKey && e.key == 'y' ) history.redo();
      else return;
    }
  
    e.preventDefault();
  }, true);
})();
