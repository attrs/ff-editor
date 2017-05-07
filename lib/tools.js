var $ = require('tinyselector');
var context = require('./context.js');

function rangeitem(id, text, tooltip, selector, fn) {
  return {
    id: id,
    text: text,
    tooltip: tooltip,
    onupdate: function(btn) {
      var range = this.range();
      if( !range ) return btn.enable(false);
    
      btn.enable(true);
      btn.active(range.iswrapped(selector));
    },
    fn: fn || function(btn) {
      var part = this;
      var range = part.range();
      if( !range ) return;
      
      range.togglewrap(selector);
      part.history().save();
    }
  };
}

module.exports = {
  insert: {
    heading: {
      id: 'insert.heading',
      text: '<i class="fa fa-header"></i>',
      tooltip: 'Heading',
      fn: function(e) {
        var placeholder = $(this.dom()).attr('placeholder');
        this.insert(new context.Heading().placeholder(placeholder));
      }
    },
    paragraph: {
      id: 'insert.paragraph',
      text: '<i class="fa fa-font"></i>',
      tooltip: '문단',
      fn: function(e) {
        var placeholder = $(this.dom()).attr('placeholder');
        this.insert(new context.Paragraph().placeholder(placeholder));
      }
    },
    imagefile: {
      id: 'insert.imagefile',
      text: '<i class="fa fa-picture-o"></i>',
      tooltip: '이미지 파일',
      fn: function(e) {
        var part = this;
        part.context().selectFiles(function(err, files) {
          if( err ) return context.error(err);
          if( !files.length ) return;
          
          part.insert(files);
        }, {
          upload: false,
          type: 'image'
        });
      }
    },
    image: {
      id: 'insert.image',
      text: '<i class="fa fa-instagram"></i>',
      tooltip: '이미지',
      fn: function(e) {
        var part = this;
        
        context.prompt('Please enter the image URL.', function(src) {
          src && part.insert(new context.Image(src));
        });
      }
    },
    video: {
      id: 'insert.video',
      text: '<i class="fa fa-youtube-square"></i>',
      tooltip: '동영상',
      fn: function(e) {
        var part = this;
        
        context.prompt('Please enter the video URL', function(src) {
          src && part.insert(new context.Video(src));
        });
      }
    },
    separator: {
      id: 'insert.separator',
      text: '<i class="fa fa-minus"></i>',
      tooltip: '구분선',
      fn: function(e) {
        this.insert(new context.Separator());
      }
    },
    link: {
      id: 'insert.link',
      text: '<i class="fa fa-link"></i>',
      tooltip: '링크',
      fn: function(e) {
        var part = this;
    
        context.prompt('Please enter the anchor URL', function(src) {
          src && part.insert(new context.Link(src));
        });
      }
    },
    attach: {
      id: 'insert.attach',
      text: '<i class="fa fa-paperclip"></i>',
      tooltip: '첨부파일',
      fn: function(e) {
        var part = this;
        
        part.context().selectFile(function(err, file) {
          if( err ) return context.error(err);
          
          part.insert(new context.Link(file));
        });
      }
    }
  },
  clear: {
    id: 'clear',
    text: '<i class="fa fa-eraser"></i>',
    tooltip: '내용 삭제',
    fn: function(e) {
      this.clear();
    }
  },
  heading: {
    id: 'heading',
    type: 'list',
    text: '<i class="fa fa-header"></i>',
    tooltip: 'Select Heading',
    onselect: function(item, i, btn) {
      var part = this;
      var dom = part.dom();
      
      if( dom.tagName.toLowerCase() !== item.tag ) {
        var el = $(part.dom());
        var parentpart = part.parent();
        
        var newpart = new context.Heading({
          tag: item.tag,
          html: el.html()
        });
        
        el.after(newpart.dom()).remove();
        
        newpart.focus();
        parentpart && parentpart.history().save();
      }
    },
    items: [
      { text: '<h1>Title</h1>', tag: 'h1' },
      { text: '<h2>Title</h2>', tag: 'h2' },
      { text: '<h3>Title</h3>', tag: 'h3' },
      { text: '<h4>Title</h4>', tag: 'h4' },
      { text: '<h5>Title</h5>', tag: 'h5' },
      { text: '<h6>Title</h6>', tag: 'h6' }
    ]
  },
  align: {
    id: 'align',
    text: '<i class="fa fa-align-justify"></i>',
    tooltip: '정렬',
    onupdate: function(btn) {
      if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
      else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
      else if( btn.align == 'justify' ) btn.text('<i class="fa fa-align-justify"></i>');
      else btn.text('<i class="fa fa-align-left"></i>');
    },
    fn: function(btn) {
      var part = this;
      var el = $(part.dom());
    
      if( btn.align == 'center' ) {
        el.css('text-align', 'right');
        btn.align = 'right';
      } else if( btn.align == 'right' ) {
        el.css('text-align', 'justify');
        btn.align = 'justify';
      } else if( btn.align == 'justify' ) {
        el.css('text-align', '');
        btn.align = '';
      } else {
        el.css('text-align', 'center');
        btn.align = 'center';
      }
      part.history().save();
    }
  },
  draggable: {
    id: 'draggable',
    text: '<i class="fa fa-hand-pointer-o"></i>',
    tooltip: '요소이동',
    onupdate: function(btn) {
      var part = this;
      var el = $(part.dom());
      
      if( el.ha('draggable') ) btn.active(true);
      else btn.active(false);
    },
    fn: function() {
      var part = this;
      part.dragmode(!part.dragmode());
    }
  },
  clearfix: {
    id: 'clearfix',
    text: '<i class="fa fa-asterisk"></i>',
    tooltip: '클리어픽스',
    onupdate: function(btn) {
      btn.active($(this.dom()).hc('f_clearfix'));
    },
    fn: function() {
      $(this.dom()).tc('f_clearfix');
      this.history().save();
    }
  },
  remove: {
    id: 'remove',
    text: '<i class="fa fa-remove"></i>',
    onupdate: function(btn) {
      if( this.removable() ) btn.show();
      else btn.hide();
    },
    fn: function() {
      this.remove();
    }
  },
  target: {
    id: 'target',
    text: '<i class="fa fa-external-link"></i>',
    tooltip: '새창으로',
    onupdate: function(btn) {
      var el = $(this.dom());
      if( el.find('a').attr('target') ) btn.active(true);
      else btn.active(false);
    },
    fn: function() {
      this.target(!this.target() ? '_blank' : null);
    }
  },
  separator: {
    shape: {
      id: 'separator.shape',
      text: '<i class="fa fa-chevron-up"></i>',
      tooltip: '모양',
      onupdate: function(btn) {
        var part = this;
        var shape = part.shape();
        if( shape == 'dotted' ) btn.text('<i class="fa fa-ellipsis-h"></i>');
        else if( shape == 'dashed' ) btn.text('<i class="fa fa-ellipsis-h"></i>');
        else if( shape == 'zigzag' ) btn.text('<i class="fa fa-chevron-up"></i>');
        else if( shape == 'line' ) btn.text('<i class="fa fa-minus"></i>');
        else btn.text('<i class="fa fa-minus"></i>');
      },
      fn: function(btn) {
        var part = this;
        var shape = part.shape();
      
        if( shape == 'dotted' ) part.shape('dashed');
        else if( shape == 'dashed' ) part.shape('zigzag');
        else if( shape == 'zigzag' ) part.shape('line');
        else if( shape == 'line' ) part.shape(false);
        else part.shape('dotted');
        part.history().save();
      }
    },
    width: {
      id: 'separator.width',
      text: '<i class="fa fa-arrows-h"></i>',
      tooltip: '너비',
      onupdate: function(btn) {
        var part = this;
        var el = $(part.dom());
      
        if( part.shape() === false ) return btn.hide();
        btn.show();
        if( el.hc('f_sep_narrow') ) btn.text('<i class="fa fa-minus"></i>');
        else btn.text('<i class="fa fa-arrows-h"></i>');
      },
      fn: function(e) {
        var part = this;
        var el = $(part.dom());
        
        el.tc('f_sep_narrow');
        this.history().save();
      }
    }
  },
  row: {
    valign: {
      id: 'row.valign',
      text: '<i class="fa fa-align-justify"></i>',
      tooltip: '정렬',
      onupdate: function(btn) {
        var part = this;
        var valign = part.valign();
        
        if( valign == 'middle' ) btn.text('<i class="fa fa-align-center ff-vert"></i>');
        else if( valign == 'bottom' ) btn.text('<i class="fa fa-align-left ff-vert"></i>');
        else if( valign == 'justify' ) btn.text('<i class="fa fa-align-justify ff-vert"></i>');
        else btn.text('<i class="fa fa-align-right ff-vert"></i>');
      },
      fn: function(btn) {
        var part = this;
        var valign = part.valign();
        
        if( valign == 'middle' ) part.valign('bottom');
        else if( valign == 'bottom' ) part.valign('justify');
        else if( valign == 'justify' ) part.valign(false);
        else part.valign('middle');
        part.history().save();
      }
    }
  },
  image: {
    floatleft: {
      id: 'image.floatleft',
      text: '<i class="fa fa-dedent"></i>',
      tooltip: '좌측플로팅',
      fn: function(btn) {
        this.floating('left').history().save();
      }
    },
    floatright: {
      id: 'image.floatright',
      text: '<i class="fa fa-dedent ff-flip"></i>',
      tooltip: '우측플로팅',
      fn: function(btn) {
        this.floating('right').history().save();
      }
    },
    size: {
      id: 'image.size',
      text: '<i class="fa fa-circle-o"></i>',
      tooltip: '크기변경',
      onupdate: function(btn) {
        var part = this;
        
        var blockmode = part.blockmode();
        if( blockmode == 'natural' ) btn.text('<i class="fa fa-square-o"></i>');
        else if( blockmode == 'medium' ) btn.text('<i class="fa fa-arrows-alt"></i>');
        else if( blockmode == 'full' ) btn.text('<i class="fa fa-circle-o"></i>');
        else btn.text('<i class="fa fa-align-center"></i>');
      },
      fn: function(btn) {
        var part = this;
        
        var blockmode = part.blockmode();
        if( blockmode == 'natural' ) part.blockmode('medium');
        else if( blockmode == 'medium' ) part.blockmode('full');
        else if( blockmode == 'full' ) part.blockmode(false);
        else part.blockmode('natural');
        
        part.history().save();
      }
    },
    upload: {
      id: 'image.upload',
      text: '<i class="fa fa-file-image-o"></i>',
      tooltip: '사진변경(업로드)',
      fn: function() {
        var part = this;
        context.selectFile(function(err, file) {
          if( err ) return context.error(err);
          if( !file ) return;
      
          part.src(file.src).title(file.name);
          part.history().save();
        });
      }
    },
    change: {
      id: 'image.change',
      text: '<i class="fa fa-instagram"></i>',
      tooltip: '사진변경',
      fn: function() {
        var part = this;
        context.prompt('Please enter the image URL.', function(src) {
          src && part.src(src).title(null);
          part.history().save();
        });
      }
    },
    align: {
      id: 'image.align',
      text: '<i class="fa fa-align-justify"></i>',
      tooltip: '정렬',
      onupdate: function(btn) {
        var part = this;
        var el = $(part.figcaption());
        var align = el.css('text-align');
    
        if( part.isFigure() ) btn.show();
        else btn.hide();
    
        if( align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
        else if( align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
        else btn.text('<i class="fa fa-align-center"></i>');
      },
      fn: function(btn) {
        var part = this;
        var el = $(part.figcaption());
        var align = el.css('text-align');
    
        if( align == 'right' ) {
          el.css('text-align', 'left');
        } else if( align == 'left' ) {
          el.css('text-align', null);
        } else {
          el.css('text-align', 'right');
        }
        part.history().save();
      }
    },
    caption: {
      id: 'image.caption',
      text: '<i class="fa fa-text-width"></i>',
      onupdate: function(btn) {
        if( this.isFigure() ) btn.active(true);
        else btn.active(false);
      },
      tooltip: '캡션',
      fn: function() {
        this.caption(!this.isFigure());
      }
    }
  },
  video: {
    size: {
      id: 'video.size',
      text: '<i class="fa fa-circle-o"></i>',
      tooltip: '크기변경',
      onupdate: function(btn) {
        var el = $(this.dom());
        if( el.hc('f_video_fit') ) btn.text('<i class="fa fa-circle-o"></i>');
        else btn.text('<i class="fa fa-arrows-alt"></i>');
      },
      fn: function() {
        var el = $(this.dom());
    
        if( el.hc('f_video_fit') ) el.rc('f_video_fit').ac('f_video_narrow');
        else el.rc('f_video_narrow').ac('f_video_fit');
      }
    }
  },
  paragraph: {
    font: {
      id: 'paragraph.font',
      type: 'list',
      text: '<i class="fa fa-font"></i>',
      tooltip: 'Select Font',
      onupdate: function(btn) {
        var range = this.range();
        
        range && btn.active(range.iswrapped('span.f_txt_font'));
      },
      onselect: function(item, i, btn) {
        var part = this;
        var dom = part.dom();
        var range = part.range();
        
        if( !range ) {
          dom.style.fontFamily = item.font || '';
          part.history().save();
          return;
        }
        
        range.unwrap('span.f_txt_font');
        var node = range.wrap('span.f_txt_font');
        node.style.fontFamily = item.font || '';
        
        part.history().save();
      },
      items: function() {
        return context.fonts();
      }
    },
    fontsize: {
      id: 'paragraph.fontsize',
      type: 'list',
      text: '<i class="fa fa-text-height"></i>',
      tooltip: 'Select Font Size',
      onupdate: function(btn) {
        var range = this.range();
        range && btn.active(range.iswrapped('span.f_txt_fontsize'));
      },
      onselect: function(item, i, btn) {
        var part = this;
        var dom = part.dom();
        var range = part.range();
        
        if( !range ) {
          dom.style.fontSize = item.size || '';
          part.history().save();
          return;
        }
        
        range.unwrap('span.f_txt_fontsize');
        var node = range.wrap('span.f_txt_fontsize');
        node.style.fontSize = item.size || '';
        
        part.history().save();
      },
      items: [
        { text: 'Default' },
        { text: '<span style="font-size:11px;">11px</span>', size: '11px' },
        { text: '<span style="font-size:12px;">12px</span>', size: '12px' },
        { text: '<span style="font-size:14px;">14px</span>', size: '14px' },
        { text: '<span style="font-size:16px;">16px</span>', size: '16px' },
        { text: '<span style="font-size:18px;">18px</span>', size: '18px' },
        { text: '<span style="font-size:20px;">20px</span>', size: '20px' }
      ]
    },
    color: {
      id: 'paragraph.color',
      type: 'list',
      text: '<i class="fa fa-square"></i>',
      tooltip: 'Select Color',
      onupdate: function(btn) {
        var range = this.range();
        range && btn.active(range.iswrapped('span.f_txt_color'));
      },
      onselect: function(item, i, btn) {
        var part = this;
        var dom = part.dom();
        var range = part.range();
        
        var change = function(color) {
          if( !range ) {
            dom.style.color = color || '';
            return;
          }
          
          range.unwrap('span.f_txt_color');
          var node = range.wrap('span.f_txt_color');
          node.style.color = color || '';
        }
        
        if( item.id == 'picker' ) {
          $('<input type="color">').on('change', function() {
            if( this.value ) change(this.value);
          }).click();
        } else {
          change(item.color);
          part.history().save();
        }
      },
      items: function() {
        var colors = context.colors().slice();
        colors.push({
          id: 'picker',
          text: 'Select Color'
        });
        return colors;
      }
    },
    bold: rangeitem('paragraph.bold', '<i class="fa fa-bold"></i>', '굵게', 'b'),
    underline: rangeitem('paragraph.underline', '<i class="fa fa-underline"></i>', '밑줄', 'u'),
    italic: rangeitem('paragraph.italic', '<i class="fa fa-italic"></i>', '이탤릭', 'i'),
    strike: rangeitem('paragraph.strike', '<i class="fa fa-strikethrough"></i>', '가로줄', 'strike'),
    anchor: rangeitem('paragraph.anchor', '<i class="fa fa-link"></i>', '링크', 'a', function(e) {
      var part = this;
      var range = part.range();
      if( !range || range.iswrapped('a') ) return range.unwrap('a');
      
      context.prompt('Please enter the anchor URL.', function(href) {
        if( !href ) return;
        var a = range.wrap('a');
        a.href = href;
        a.target = '_blank';
        part.history().save();
      });
    })
  }
};