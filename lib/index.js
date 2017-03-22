var ctx = require('./context.js');
var Toolbar = require('./toolbar/');

require('./less/index.less');
require('sweetalert/dist/sweetalert.css');

var Part = require('./part.js');
var ArticlePart = require('./types/article/article.js');
var ParagraphPart = require('./types/paragraph/paragraph.js');
var TextPart = require('./types/text/text.js');
var SeparatorPart = require('./types/separator/separator.js');
var ImagePart = require('./types/image/image.js');
var VideoPart = require('./types/video/video.js');
var RowPart = require('./types/row/row.js');
var FilePart = require('./types/file/file.js');

ctx.Toolbar = Toolbar;
ctx.Part = Part;
ctx.Article = ArticlePart;
ctx.Paragraph = ParagraphPart;
ctx.Text = TextPart;
ctx.Separator = SeparatorPart;
ctx.Image = ImagePart;
ctx.Video = VideoPart;
ctx.Row = RowPart;
ctx.File = FilePart;

ctx.type('default', ParagraphPart);
ctx.type('article', ArticlePart);
ctx.type('paragraph', ParagraphPart);
ctx.type('text', TextPart);
ctx.type('separator', SeparatorPart);
ctx.type('image', ImagePart);
ctx.type('video', VideoPart);
ctx.type('row', RowPart);
ctx.type('file', FilePart);

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

module.exports = ctx;
