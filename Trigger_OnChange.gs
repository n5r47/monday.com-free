function onChange(e) {
  var changeType = e.changeType;
  
  if (changeType === 'INSERT_ROW' || changeType === 'REMOVE_ROW') {
    // your code here for row insertion or deletion
    synchronizeStatuses();
  }
}
