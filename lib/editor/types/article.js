var xmodal = require('x-modal');
var Part = require('../part.js');
var MediumEditor = require('medium-editor');
require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/default.css');


module.exports = function ArticlePart(el) {
  Part.call(this, el);
  
  var editor;
  
  //editor.subscribe('editableInput', function(event, editable) {
  //  editable.innerHTML.trim();
  //});
  //editor.init(element, bindOptions);
  
  var o = {
    init: function(done) {
      done();
    },
    setData: function(data) {
      if( data.html ) el.innerHTML = data.html;
    },
    getData: function() {
      return {
        html: el.innerHTML
      };
    },
    editmode: function(b) {
      editor && editor.destroy();
      
      if( b ) editor = new MediumEditor(el, {
        placeholder: false,
        toolbar: {
          allowMultiParagraphSelection: true,
          buttons: ['bold', 'italic', 'underline', 'anchor', 'h1', 'h2', 'h3', 'quote'],
          diffLeft: 0,
          diffTop: -10,
          firstButtonClass: 'medium-editor-button-first',
          lastButtonClass: 'medium-editor-button-last',
          relativeContainer: null,
          standardizeSelectionStart: false,
          static: false,
          align: 'center',
          sticky: false,
          updateOnEmptySelection: false
        },
        anchor: {
          customClassOption: null,
          customClassOptionText: 'Button',
          linkValidation: true,
          placeholderText: '링크를 입력하세요',
          targetCheckbox: true,
          targetCheckboxText: '새창으로 열기'
        },
        paste: {
          forcePlainText: true,
          cleanPastedHTML: false,
          cleanReplacements: [],
          cleanAttrs: ['class', 'style', 'dir'],
          cleanTags: ['meta'],
          unwrapTags: []
        }
      });
    }
  };
};