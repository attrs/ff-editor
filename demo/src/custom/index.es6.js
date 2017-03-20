import {Part} from 'firefront';

class CustomPart extends Part {
  constructor(el) {
    super(el);
    
    this.toolbar().clear().add({
      text: '<i class="fa fa-pencil"></i>',
      fn: function(e) {
      }
    })
    .add({
      text: '<i class="fa fa-list"></i>',
      fn: function(e) {
      }
    });
  }
  
  onfocus(e) {
    console.log('focus', e);
  }
  
  onrender(e) {
    console.log('render', e);
  }
  
  onupdate(e) {
    console.log('update', e);
  }
  
  test() {
    console.log('OK!', this);
  }
}

export default CustomPart;