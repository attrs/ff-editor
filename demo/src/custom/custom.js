import {Part} from 'firefront';

class CustomPart extends Part {
  constructor(el) {
    super(el);
    
    this.toolbar().clear().add({
      text: '<i class="fa fa-pencil"></i>',
      fn: function(e) {
        router.href('/config', {
          data: this.data,
          done: function() {
          
          }
        }, false);
      }
    })
    .add({
      text: '<i class="fa fa-list"></i>',
      fn: function(e) {
        router.href('/select', {
          done: function() {
          
          }
        }, false);
      }
    });
  }
  
  onFocus(e) {
    console.log('focus', e);
  }
  
  onRender(e) {
    console.log('render', e);
  }
  
  onUpdate(e) {
    console.log('update', e);
  }
  
  test() {
    console.log('OK!', this);
  }
}

export default CustomPart;