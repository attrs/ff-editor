var Context = require('./context.js');
var Toolbar = require('./toolbar.js');

require('./less/index.less');

var Part = require('./part.js');
var TextPart = require('./types/text/text.js');
var ArticlePart = require('./types/article/article.js');
var ParagraphPart = require('./types/paragraph/paragraph.js');
var SeparatorPart = require('./types/separator/separator.js');
var ImagePart = require('./types/image/image.js');
var VideoPart = require('./types/video/video.js');
var FloaterPart = require('./types/floater/floater.js');

Context.Toolbar = Toolbar;
Context.Part = Part;
Context.Text = TextPart;
Context.Article = ArticlePart;
Context.Paragraph = ParagraphPart;
Context.Separator = SeparatorPart;
Context.Image = ImagePart;
Context.Video = VideoPart;
Context.Floater = FloaterPart;

Context.types().define('default', Part);
Context.types().define('text', TextPart);
Context.types().define('article', ArticlePart);
Context.types().define('paragraph', ParagraphPart);
Context.types().define('separator', SeparatorPart);
Context.types().define('image', ImagePart);
Context.types().define('video', VideoPart);
Context.types().define('floater', FloaterPart);

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
