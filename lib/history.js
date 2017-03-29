function EditHistory(part) {
  var list = [];
  var index = -1;
  
  function redo() {
    //TODO: console.log('redo');
  }
  
  function undo() {
    //TODO: console.log('undo');
  }
  
  function save(action) {
    list.push(action);
    index = list.length - 1;
  }
  
  return {
    save: save,
    undo: undo,
    redo: redo,
    list:  function() {
      return list;
    }
  }
}


module.exports = EditHistory;