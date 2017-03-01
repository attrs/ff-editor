var Context = require('./context.js');
var Toolbar = require('./toolbar.js');

require('./less/index.less');

var Part = require('./types/default/part.js');
var TextPart = require('./types/text/text.js');
var ArticlePart = require('./types/article/article.js');
var ParagraphPart = require('./types/paragraph/paragraph.js');
var HeadingPart = require('./types/heading/heading.js');
var ImagePart = require('./types/image/image.js');
var VideoPart = require('./types/video/video.js');

Context.Toolbar = Toolbar;
Context.Part = Part;
Context.TextPart = TextPart;
Context.ArticlePart = ArticlePart;
Context.ParagraphPart = ParagraphPart;
Context.HeadingPart = HeadingPart;
Context.ImagePart = ImagePart;
Context.VideoPart = VideoPart;

Context.types().define('default', Part);
Context.types().define('text', TextPart);
Context.types().define('article', ArticlePart);
Context.types().define('paragraph', ParagraphPart);
Context.types().define('heading', HeadingPart);
Context.types().define('image', ImagePart);
Context.types().define('video', VideoPart);

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
