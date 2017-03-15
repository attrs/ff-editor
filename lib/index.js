var Context = require('./context.js');
var Toolbar = require('./toolbar/');

require('./less/index.less');

var Part = require('./part.js');
var ArticlePart = require('./types/article/article.js');
var ParagraphPart = require('./types/paragraph/paragraph.js');
var SeparatorPart = require('./types/separator/separator.js');
var ImagePart = require('./types/image/image.js');
var VideoPart = require('./types/video/video.js');
var RowPart = require('./types/row/row.js');

Context.Toolbar = Toolbar;
Context.Part = Part;
Context.Article = ArticlePart;
Context.Paragraph = ParagraphPart;
Context.Separator = SeparatorPart;
Context.Image = ImagePart;
Context.Video = VideoPart;
Context.Row = RowPart;

Context.types().define('default', ParagraphPart);
Context.types().define('article', ArticlePart);
Context.types().define('paragraph', ParagraphPart);
Context.types().define('separator', SeparatorPart);
Context.types().define('image', ImagePart);
Context.types().define('video', VideoPart);
Context.types().define('row', RowPart);

(function() {
  var readyfn;
  
  document.addEventListener('DOMContentLoaded', function() {
    Context.scan();
    readyfn && readyfn();
  });

  Context.ready = function(fn) {
    if( document.body ) fn();
    else readyfn = fn;
  };
})();

module.exports = Context;
