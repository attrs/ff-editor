var ctx = require('./context.js');
var Toolbar = require('./toolbar/');
var Part = require('./part.js');
var Items = require('./items.js');

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

ctx.Article = ArticlePart;
ctx.Paragraph = ParagraphPart;
ctx.Separator = SeparatorPart;
ctx.Image = ImagePart;
ctx.Video = VideoPart;
ctx.Row = RowPart;
ctx.Link = LinkPart;
ctx.Text = TextPart;

ctx.type('default', ParagraphPart);
ctx.type('article', ArticlePart);
ctx.type('paragraph', ParagraphPart);
ctx.type('text', TextPart);
ctx.type('separator', SeparatorPart);
ctx.type('image', ImagePart);
ctx.type('video', VideoPart);
ctx.type('row', RowPart);
ctx.type('link', LinkPart);

(function() {
  var readyfn;
  
  document.addEventListener('DOMContentLoaded', function() {
    ctx.scan();
    readyfn && readyfn();
  });

  ctx.ready = function(fn) {
    if( document.body ) fn();
    else readyfn = fn;
  };
})();

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

module.exports = ctx;
