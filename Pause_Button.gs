function setOnHoldForCurrentUser() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var user = Session.getActiveUser().getEmail();
  
  Logger.log("Current User Email: " + user);
  
  // Define your assignee-email mapping range
  var mappingRange = spreadsheet.getSheetByName("Data_Validation").getRange("D1:E15");
  var mappingValues = mappingRange.getValues();
  var assigneeForUser = null;
  
  // Map the user's email to the assignee name
  for (var i = 0; i < mappingValues.length; i++) {
    if (mappingValues[i][1] === user) {
      assigneeForUser = mappingValues[i][0];
      break;
    }
  }
  
  Logger.log("Mapped Assignee for User Email: " + assigneeForUser);
  
  if (!assigneeForUser) {
    Logger.log('No assignee found for the user.');
    return;
  }
  
  // Filter the work_hours sheet based on that assignee
  var workHoursSheet = spreadsheet.getSheetByName("Work_Hours");
  var assigneeRange = workHoursSheet.getRange("F2:F" + workHoursSheet.getLastRow());
  var assigneeValues = assigneeRange.getValues();
  
  for (var i = 0; i < assigneeValues.length; i++) {
    if (assigneeValues[i][0] === assigneeForUser) {
      var statusCell = workHoursSheet.getRange(i + 2, 7); // +2 to account for the header and 0-based array
      if (statusCell.getValue() === "Working On it") {
        Logger.log("Changing status for Assignee: " + assigneeForUser + " at row " + (i + 2));
        statusCell.setValue("On Hold");
        
        // Now, update the corresponding status in Content_Creation and Project_Management
        var id = workHoursSheet.getRange(i + 2, 2).getValue();
        updateStatusInMainSheets(id, "On Hold", spreadsheet);
      }
    }
  }
}

function updateStatusInMainSheets(id, status, spreadsheet) {
  var sheetsToUpdate = ["Content_Creation", "Project_Management"];
  
  sheetsToUpdate.forEach(function(sheetName) {
    var sheet = spreadsheet.getSheetByName(sheetName);
    var idsRange = sheet.getRange("B2:B" + sheet.getLastRow());
    var ids = idsRange.getValues().flat();
    var rowIndex = ids.indexOf(id);
    
    if (rowIndex !== -1) {
      Logger.log("Updating status for ID: " + id + " in sheet: " + sheetName + " at row " + (rowIndex + 2));
      sheet.getRange(rowIndex + 2, 5).setValue(status); // +2 because array is 0-based and we started from 2nd row
    } else {
      Logger.log("No matching ID: " + id + " found in sheet: " + sheetName);
    }
  });
}
