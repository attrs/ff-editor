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
var FilePart = require('./types/file/file.js');

ctx.Article = ArticlePart;
ctx.Paragraph = ParagraphPart;
ctx.Separator = SeparatorPart;
ctx.Image = ImagePart;
ctx.Video = VideoPart;
ctx.Row = RowPart;
ctx.File = FilePart;

ctx.type('default', ParagraphPart);
ctx.type('article', ArticlePart);
ctx.type('paragraph', ParagraphPart);
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
