function getSheetAndRowById(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ['Content_Creation', 'Project_Management'];

  for (var i = 0; i < sheets.length; i++) {
    var sheet = ss.getSheetByName(sheets[i]);
    var ids = sheet.getRange("B:B").getValues();
    for (var j = 0; j < ids.length; j++) {
      if (ids[j][0] == id) {
        return { sheet: sheet, row: j + 1 };
      }
    }
  }
  return null;
}

function startTimer(row) {
  console.log("Function startTimer called with row:", row);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();
  var id = activeSheet.getRange("B" + row).getValue();

  console.log("ID fetched from the row:", id);

  var result = getSheetAndRowById(id);
  if (!result) return;
  var sheet = result.sheet;
  var row = result.row;

  var timeStatusCell = sheet.getRange(row, 17); // Column Q
  if (timeStatusCell.getValue() == '') {    
    timeStatusCell.setValue('Started');
    sheet.getRange(row, 13).setValue(new Date()); // Column M
  } else if (timeStatusCell.getValue() == 'Paused') {
    // If restarting after a pause, record the end of the pause
    var resumeTime = new Date();
    var pauseEndsCell = sheet.getRange(row, 16); // Column P
    var currentPauseEnds = pauseEndsCell.getValue();
    pauseEndsCell.setValue(currentPauseEnds + resumeTime + ",");
    
    timeStatusCell.setValue('Started');
  }
  // If timer is already started, do nothing
}

function pauseTimer(row) {
  console.log("Function pauseTimer called with row:", row);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();
  var id = activeSheet.getRange("B" + row).getValue();

  console.log("ID fetched from the row:", id);

  var result = getSheetAndRowById(id);
  if (!result) return;
  var sheet = result.sheet;
  var row = result.row;

  var timeStatusCell = sheet.getRange(row, 17); // Column Q
  if (timeStatusCell.getValue() == 'Started') {
    timeStatusCell.setValue('Paused');
    
    // Record the pause start time with a formatted string
    var pauseTime = new Date();
    var pauseStartsCell = sheet.getRange(row, 15); // Column O
    var currentPauseStarts = pauseStartsCell.getValue();
    pauseStartsCell.setValue(currentPauseStarts + pauseTime + ",");
  }
}

function stopTimer(row) {
  console.log("Function stopTimer called with row:", row);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();
  var id = activeSheet.getRange("B" + row).getValue();

  console.log("ID fetched from the row:", id);

  var result = getSheetAndRowById(id);
  if (!result) return;
  var sheet = result.sheet;
  var row = result.row;

  var timeStatusCell = sheet.getRange(row, 17); // Column Q
  if (timeStatusCell.getValue() == 'Paused' || timeStatusCell.getValue() == 'Started') {
    
    var endTime = new Date();
    
    // If the timer is paused when stopped, record this end time with a formatted string
    if (timeStatusCell.getValue() == 'Paused') {
      var pauseTime = Utilities.formatDate(endTime, "GMT+0530", "MMM dd yyyy HH:mm:ss");
      var pauseEndsCell = sheet.getRange(row, 16); // Column P
      var currentPauseEnds = pauseEndsCell.getValue();
      pauseEndsCell.setValue(currentPauseEnds + pauseTime + ",");
    }
    
    timeStatusCell.setValue('Stopped');
    
    var startTime = new Date(sheet.getRange(row, 13).getValue()); // Column M
    var elapsedTime = (endTime - startTime) / 1000; // in seconds
    
    // Subtract the paused durations
    var pauseStarts = sheet.getRange(row, 15).getValue().split(","); // Column O
    var pauseEnds = sheet.getRange(row, 16).getValue().split(","); // Column P
    for (var i = 0; i < pauseStarts.length - 1; i++) {
      elapsedTime -= (new Date(pauseEnds[i]) - new Date(pauseStarts[i])) / 1000;
    }

    // Convert seconds to HH:MM format
    var totalHours = Math.floor(elapsedTime / 3600);
    var totalMinutes = Math.floor((elapsedTime % 3600) / 60);

    var timeString = totalHours + ":" + (totalMinutes < 10 ? "0" : "") + totalMinutes;

    // Update Total Elapsed Time
    var totalElapsedTimeCell = sheet.getRange(row, 18); // Column R
    var cellValue = totalElapsedTimeCell.getValue();
    var prevTotalElapsedTime = (typeof cellValue === 'string' && cellValue.includes(":")) ? cellValue.split(":") : ["0", "0"];
    var prevHours = parseInt(prevTotalElapsedTime[0]);
    var prevMinutes = parseInt(prevTotalElapsedTime[1]);
    
    totalHours += prevHours;
    totalMinutes += prevMinutes;
    if (totalMinutes >= 60) {
      totalHours += 1;
      totalMinutes -= 60;
    }
    
    var totalTimeString = totalHours + ":" + (totalMinutes < 10 ? "0" : "") + totalMinutes;

    totalElapsedTimeCell.setValue(totalTimeString);
    sheet.getRange(row, 14).setValue(endTime); // set end time (if you want to retain this)
  }
}

function resetTimer(row) {
  console.log("Function resetTimer called with row:", row);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();
  var id = activeSheet.getRange("B" + row).getValue();

  console.log("ID fetched from the row:", id);

  var result = getSheetAndRowById(id);
  if (!result) return;
  var sheet = result.sheet;
  var row = result.row;

  sheet.getRange(row, 13).setValue(''); // Column M
  sheet.getRange(row, 14).setValue(''); // Column N
  sheet.getRange(row, 15).setValue(''); // Column O
  sheet.getRange(row, 16).setValue(''); // Column P
  sheet.getRange(row, 17).setValue(''); // Column Q
  sheet.getRange(row, 18).setValue(''); // Column R
}