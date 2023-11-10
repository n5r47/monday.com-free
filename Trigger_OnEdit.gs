// A global variable to prevent recursive edits
var isScriptEdit = false;

function onEdit(e) {
  if (isScriptEdit) {
    // If the edit is made by the script, reset the flag and return
    isScriptEdit = false;
    return;
    Logger.log("script edit detected");
  }

  var sheet = e.source.getActiveSheet();
  var editedRange = e.range;
  var editedRow = editedRange.getRow();
  var editedColumn = editedRange.getColumn();
  var editedValue = editedRange.getValue();
  var id = sheet.getRange(editedRow, 2).getValue();  // Column B value

  //1.0 Sync Status from Content_Creation & Project_Management
  if ((sheet.getName() === "Content_Creation" || sheet.getName() === "Project_Management") && (editedColumn === 2 || editedColumn === 8)) {
  Logger.log("Change detected in Content_Creation or Project_Management in columns 2 or 8.");
  synchronizeStatuses();  // call the function to synchronize statuses
  }

  // 1.1: If Work_Hours' Column G has been edited
  if (sheet.getName() === "Work_Hours" && editedColumn === 7) {
    // Timer functionality starts here
    var status = editedValue; // the new status value from Column G
    if (status === "Working On it") {
      Logger.log("Edited Row:", editedRow);
      startTimer(editedRow);
    } else if (status === "On Hold" || status === "In Review") {
      pauseTimer(editedRow);
    } else if (status === "Done") {
      stopTimer(editedRow);
      checkAndCopyGroupToDump(id);
    }

    var contentCreationSheet = e.source.getSheetByName("Content_Creation");
    var projectManagementSheet = e.source.getSheetByName("Project_Management");

    // Update status in Content_Creation sheet if task/subtask found
    var targetRowCC = findRowById(contentCreationSheet, id);
    if (targetRowCC && !contentCreationSheet.getRange(targetRowCC, 3).getValue()) { // Ensure it's a subtask
      isScriptEdit = true;
      contentCreationSheet.getRange(targetRowCC, 5).setValue(editedValue);  // 5 corresponds to column E
    }
    
    // Update status in Project_Management sheet if task/subtask found
    var targetRowPM = findRowById(projectManagementSheet, id);
    if (targetRowPM && !projectManagementSheet.getRange(targetRowPM, 3).getValue()) { // Ensure it's a subtask
      isScriptEdit = true;
      projectManagementSheet.getRange(targetRowPM, 5).setValue(editedValue);  // 5 corresponds to column E
    }

  } 

    // 1.2: If Column 'E' of Content_Creation or Project_Management has been updated
else if ((sheet.getName() === "Content_Creation" || sheet.getName() === "Project_Management") && editedColumn === 5) {
  // Handling timer function calls for status changes
  var status = editedValue;  // the new status value from Column E
  var row = findRowById(sheet, id);  // Find the corresponding row in the current sheet

  if (row) {
    if (status === "Working On it") {
      startTimer(row);
    } else if (status === "On Hold" || status === "In Review") {
      pauseTimer(row);
    } else if (status === "Done") {
      stopTimer(row);
      checkAndCopyGroupToDump(id);
    } else {
      Logger.log("Unrecognized status: " + status);
    }
  } else {
    Logger.log("ID not found or invalid: " + id);
  }

  // existing 1.2 code
  var idValue = sheet.getRange(editedRow, 2).getValue();  // Column B value
  // Only call automateNewTaskEntry if there is no ID in Column B
  if (!idValue) {
    automateNewTaskEntry();
  }

  var taskValue = sheet.getRange(editedRow, 3).getValue();  // Column C value
  var subtaskValue = sheet.getRange(editedRow, 4).getValue();  // Column D value

  var workHoursSheet = e.source.getSheetByName("Work_Hours");
  var targetRow = findRowById(workHoursSheet, idValue);
        
  if (targetRow) {
    if (taskValue && !subtaskValue) { // Main task
      // Do nothing for main tasks for now as main tasks have categories in 'E'
    } 
    // Subtask status update
    else if (!taskValue && subtaskValue) {
      isScriptEdit = true;
      workHoursSheet.getRange(targetRow, 7).setValue(editedValue);  // 7 corresponds to column G
    }
  }
}
    
}

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

// function to check if the progress bar is full
function checkProgressBarIsFull(sheet, mainItemRow) {
  // Fetch the COUNT formula from column J
  var countFormula = sheet.getRange("J" + mainItemRow).getFormula();
  
  // Replace COUNT with SUM
  var sumFormula = countFormula.replace("COUNT", "SUM");
  
  // Evaluate the SUM formula
  var sumValue = sheet.getRange("J" + mainItemRow).setFormula(sumFormula).getValue();
  
  // Restore the original COUNT formula
  sheet.getRange("J" + mainItemRow).setFormula(countFormula);
  
  // Fetch the COUNT value
  var countValue = sheet.getRange("J" + mainItemRow).getValue();
  
  // Compare SUM and COUNT values
  return sumValue === countValue;
}

function checkAndCopyGroupToDump(id) {
  Logger.log("Running checkAndCopyGroupToDump for ID: " + id);
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var dumpSheet = spreadsheet.getSheetByName("Dump");
  var dataValidationSheet = spreadsheet.getSheetByName("Data_Validation");
  
  // Extract the main item ID from the subitem ID
  var mainItemId = id.split(".")[0];
  Logger.log("Extracted Main Item ID: " + mainItemId);
  
  // Fetch sheet codes and names from Data_Validation
  var sheetData = dataValidationSheet.getRange("G16:H29").getValues().filter(row => row[0] && row[1]);
  Logger.log("Sheet Data: " + JSON.stringify(sheetData));
  
  // Find the corresponding sheet
  var sheetCode = mainItemId.substring(0, 3);
  Logger.log("Extracted Sheet Code: " + sheetCode);

  var sheetName = sheetData.find(row => row[1] === sheetCode)[0];
  Logger.log("Corresponding Sheet Name: " + sheetName);
  
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  // Find the row number for the main task ID in the sheet
  var ids = sheet.getRange("B:B").getValues().flat();
  var mainItemRow = ids.indexOf(mainItemId) + 1;
  Logger.log("Main Item Row: " + mainItemRow);
  
  // Check if the progress bar is complete using the new function
  if (checkProgressBarIsFull(sheet, mainItemRow)) {
    Logger.log("Progress bar is complete. Copying group to Dump sheet.");
    copyGroupToDumpSheet(sheet, mainItemRow);
  } else {
    Logger.log("Progress bar is not complete. No action taken.");
  }
}

// Function to copy a group of rows to the "Dump" sheet
function copyGroupToDumpSheet(sheet, startRow) {
  Logger.log("Running copyGroupToDumpSheet for startRow: " + startRow);
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var dumpSheet = spreadsheet.getSheetByName("Dump");
  var lastRow = dumpSheet.getLastRow();
  Logger.log("Last Row in Dump Sheet: " + lastRow);
  
  // Get the number of subtasks from the J column of the main task row
  var numSubtasks = sheet.getRange("J" + startRow).getValue();
  Logger.log("Number of subtasks: " + numSubtasks);
  
  // Calculate the end row based on the number of subtasks
  var endRow = startRow + numSubtasks;
  Logger.log("End Row of Group: " + endRow);
  
  // Copy the entire group from the source sheet to the "Dump" sheet
  var groupValues = sheet.getRange(startRow, 1, endRow - startRow + 1, sheet.getLastColumn()).getValues();
  dumpSheet.getRange(lastRow + 1, 1, endRow - startRow + 1, sheet.getLastColumn()).setValues(groupValues);
  
  // Apply grouping in the "Dump" sheet
  // Start grouping from one row below the main task (to avoid grouping the main task with the row above)
  dumpSheet.getRange(lastRow + 2, 1, endRow - startRow, 1).shiftRowGroupDepth(1);
  Logger.log("Group copied and applied in Dump sheet.");
}