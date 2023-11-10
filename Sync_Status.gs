function automateNewTaskEntry() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();  // Get the active sheet

  var sheetName = sheet.getName();

  if (sheetName !== "Content_Creation" && sheetName !== "Project_Management") {
    throw new Error("This function is only intended for Content_Creation or Project_Management sheets.");
  }
  
  var lastRow = sheet.getActiveRange().getRow();
  var workHoursSheet = spreadsheet.getSheetByName("Work_Hours");
  var channelSheet = spreadsheet.getSheetByName("Data_Validation");

  // Get the channel from the edited row (assuming same column)
  var channel = sheet.getRange("E" + lastRow).getValue();

  // Get the corresponding subtasks for the channel
  var subtasks = [];
  var channelRange = channelSheet.getRange("A16:B32");
  var channelData = channelRange.getValues();
  for (var i = 0; i < channelData.length; i++) {
    if (channelData[i][0] == channel) {
      subtasks = channelData[i][1].split(", ");
      break;
    }
  }

  // Insert new rows for subtasks
  sheet.insertRowsAfter(lastRow, subtasks.length);

    // Fetch the client names and prefixes from the Data_Validation sheet
  var clientData = channelSheet.getRange("E16:F28").getValues();
  var sheetData = channelSheet.getRange("G16:H28").getValues();

  // Get sheet code
  var sheetCode = "";
  for (var i = 0; i < sheetData.length; i++) {
    if (sheetData[i][0] === sheetName) {
        sheetCode = sheetData[i][1];
        break;
    }
  }

  // Identify the client section or use the client prefix in Column A if in the Project_Management sheet
  var clientPrefix = "";
  if (sheetName === "Content_Creation") {
    for (var i = lastRow - 1; i > 0; i--) {
      var potentialHeader = sheet.getRange("B" + i).getValue();
      for (var j = 0; j < clientData.length; j++) {
        if (clientData[j][0] === potentialHeader) {
          clientPrefix = clientData[j][1];
          break;
        }
      }
      if (clientPrefix) break;
    }
    if (!clientPrefix) {
      throw new Error("Unable to identify client section.");
    }
  } else if (sheetName === "Project_Management") {
    var clientName = sheet.getRange("A" + lastRow).getValue();
    for (var j = 0; j < clientData.length; j++) {
      if (clientData[j][0] === clientName) {
        clientPrefix = clientData[j][1];
        break;
      }
    }
  }

  // Combine the sheet code and client prefix
  var combinedPrefix = sheetCode + clientPrefix;

// 1. Assign the next ID number.
var maxID = 0;
var allIdsInColumnB = sheet.getRange("B2:B" + lastRow).getValues();
for (var i = 0; i < allIdsInColumnB.length; i++) {
    if (allIdsInColumnB[i][0].startsWith(combinedPrefix + "-")) {
        var numericPart = parseInt(allIdsInColumnB[i][0].replace(combinedPrefix + "-", ""), 10);
        if (Number.isInteger(numericPart) && numericPart > maxID) {
            maxID = numericPart;
        }
    }
}
var nextID = combinedPrefix + "-" + String(maxID + 1).padStart(2, '0');
sheet.getRange("B" + lastRow).setValue(nextID);

// 2. Add the specified subtasks and their corresponding IDs.
var currentDate = new Date();
for (var i = 0; i < subtasks.length; i++) {
    sheet.getRange("D" + (lastRow + i + 1)).setValue(subtasks[i]);
    
    // Create subtask ID based on main task ID
    var subtaskID = nextID + "." + String(i + 1).padStart(2, '0');
    sheet.getRange("B" + (lastRow + i + 1)).setValue(subtaskID);

    // Clear data validation for subtasks in G column
    sheet.getRange("G" + (lastRow + i + 1)).setDataValidation(null);

    // Set the date for each subtask
    sheet.getRange("H" + (lastRow + i + 1)).setValue(currentDate);
    currentDate.setDate(currentDate.getDate() + 2);  // Add 2 days for the next subtask
}

  // Set the client's name formula in K column for the main task
  sheet.getRange("K" + lastRow).setFormula('=IF(ISNUMBER(B' + (lastRow - 1) + '), K' + (lastRow - 1) + ', "")');

  // 3. Create data validation rules for the statuses and set the first subtask's status
  var statusRange = channelSheet.getRange("A2:A15");
  var rule = SpreadsheetApp.newDataValidation().requireValueInRange(statusRange).setAllowInvalid(false).build();
  for (var i = 0; i < subtasks.length; i++) {
    sheet.getRange("E" + (lastRow + i + 1)).setDataValidation(rule);
    if (i === 0) {
      sheet.getRange("E" + (lastRow + i + 1)).setValue(channelSheet.getRange("A4").getValue());
    } else {
      sheet.getRange("E" + (lastRow + i + 1)).setValue(channelSheet.getRange("A4").getValue());
    }
  }

  // 4. Add the provided formula to the 9th column for each of the added subtasks.
  for (var i = 0; i < subtasks.length; i++) {
    var formula = '=IFERROR(IF($E' + (lastRow + i + 1) + '="Done", 1, IF(OR($E' + (lastRow + i + 1) + '="Working on it", $E' + (lastRow + i + 1) + '="In Review", $E' + (lastRow + i + 1) + '="On Hold"), 0.5, IF($E' + (lastRow + i + 1) + '="Not Started", 0, ""))), 0)';
    sheet.getRange("I" + (lastRow + i + 1)).setFormula(formula);
  }

  // 5. Sparkline formula for progress bar
  var sparklineRange = "I" + (lastRow + 1) + ":I" + (lastRow + subtasks.length);
  var maxCharacteristic = "J" + lastRow;
 var sparklineFormula = '=SPARKLINE(SUM(' + sparklineRange + '), {"charttype", "bar"; "max", ' + maxCharacteristic + '; "color1", "green"})';
  sheet.getRange("I" + lastRow).setFormula(sparklineFormula);

  // 6. Implement the COUNT formula in the 10th column.
  var countFormula = '=COUNT(I' + (lastRow + 1) + ':I' + (lastRow + subtasks.length) + ')';
  sheet.getRange("J" + lastRow).setFormula(countFormula);

  // 7. Set the deadline date for the main task
  var deadlineFormula = '=MAX(H' + (lastRow + 1) + ':H' + (lastRow + subtasks.length) + ')';
  sheet.getRange("H" + lastRow).setFormula(deadlineFormula);

  // 8. Group the subtasks under the main task
  var firstRowOfGroup = lastRow + 1; // start grouping from the first subtask
  var lastRowOfGroup = lastRow + subtasks.length;
  sheet.getRange(firstRowOfGroup, 1, lastRowOfGroup - firstRowOfGroup + 1).shiftRowGroupDepth(1);

  // 9. Reflect these subtask status changes in the "Work_Hours" sheet
  for (var i = 0; i < subtasks.length; i++) {
    var subtaskId = sheet.getRange("B" + (lastRow + i + 1)).getValue();  // Subtask ID
    var status = sheet.getRange("E" + (lastRow + i + 1)).getValue();     // Status of the subtask
    var targetRow = findRowById(workHoursSheet, subtaskId);
    
    if (targetRow) {
      workHoursSheet.getRange(targetRow, 7).setValue(status);  // 7 corresponds to column G for status in "Work_Hours"
    }
  }

  // 10. Set Start Time for the Main Task
  var startTimeFormula = '=MIN(M' + (lastRow + 1) + ':M' + (lastRow + subtasks.length) + ')';
  sheet.getRange("M" + lastRow).setFormula(startTimeFormula);

  // 11. Set End Time for the Main Task
  var endTimeFormula = '=MAX(N' + (lastRow + 1) + ':N' + (lastRow + subtasks.length) + ')';
  sheet.getRange("N" + lastRow).setFormula(endTimeFormula);

  // 12. Set Total Elapsed Time for the Main Task
  var elapsedTimeFormula = '=SUM(R' + (lastRow + 1) + ':R' + (lastRow + subtasks.length) + ')';
  sheet.getRange("R" + lastRow).setFormula(elapsedTimeFormula);

function findRowById(sheet, id) {
  // This function finds the row number of a given ID in a sheet
  var ids = sheet.getRange("B:B").getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      return i + 1; // +1 because array index starts from 0, whereas row numbers start from 1
    }
  }
  return null;
}
}