import {Part} from 'firefront';

class TestPart extends Part {
  constructor(el) {
    super(el);
  
    this.on('focus', function(e) {
      console.log('notice', this.id);
    })
    .on('update', function(e) {
      console.log('update', this.id, this.data);
    })
    .toolbar().clear().add({
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
  
  test() {
    console.log('OK!', this);
  }
}

console.log('TestPart', TestPart);

export default TestPart;