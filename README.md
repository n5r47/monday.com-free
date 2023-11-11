# Google Sheets-Based Work OS - A Free Alternative for monday.com

## Hi!
I'm a content creator with a love for tech, and I've made a Google Sheets-based Work OS that's inspired by monday.com but friendly for the bootstrap startup. It's reasonably user-friendly, budget-friendly, and just has enough function to keep the ball rolling!

## Getting Started with the Work OS Template
To make setting up your Google Sheets-based Work OS even easier, we've provided a ready-to-use Excel template named "Work OS Template". This template mirrors the structure required for the scripts to function correctly.

### How to Use the Template
1. **Download the Template:** Start by downloading the "Work OS Template.xlsx" file.
2. **Import to Google Sheets:** Open Google Sheets, go to `File > Open > Upload`, and select the downloaded template.
3. **Adapt and Customize:** Once uploaded, Go Through `Data_Validation`, and setup your own values.
This will help you add tasks in `Content_Creation` which is for recurring clients & `Project_Management` is for all one-time tasks.
you can adapt and customize the sheets to suit your specific workflow needs.

Your Team can use the `Work_Hours` Sheet with their Name's filter to track their tasks.

## The Gist of This Project

### 1. **Automated Task and Subtask Management**
- **Function: `automateNewTaskEntry`**
- Automates task entry, subtask creation, and ID assignment in Content_Creation and Project_Management sheets.
- Ensures streamlined task breakdowns and proper organization of projects.

### 2. **Real-time Status Synchronization and Time Tracking**
- **Function: `onEdit`,`startTimer`, `pauseTimer`, `stopTimer`, `resetTimer`**
- Synchronizes task and subtask statuses across sheets.
- Handles time tracking functionalities like starting, pausing, stopping, and resetting timers based on task status.

### 3. **User-Specific Task Management**
- **Function: `setOnHoldForCurrentUser`**
- Allows tasks to be set 'On Hold' based on the current user, for quickly pausing the ongoing task.
- Useful for teams where tasks are distributed among multiple members.

### 4. **Dynamic Response to Sheet Changes**
- **Function: `onChange`**
- Reacts to changes such as row insertions or deletions, maintaining the integrity and up-to-date status of tasks.

### 5. **Progress Monitoring and Archiving**
- **Functions: `checkProgressBarIsFull` and `checkAndCopyGroupToDump`**
- Monitors the completion progress of tasks and moves completed tasks to the 'Dump' sheet for record-keeping.
- Ensures a clean and organized view of ongoing and completed projects.

### 6. **Custom Menu Integration in Google Sheets UI**
- **Function: `onOpen`**
- Provides easy access to key functionalities like syncing subitem statuses and automating new tasks directly from Google Sheets.

### 7. **Enhanced Task and Time Management**
- **Function: `getSheetAndRowById`**
- Retrieves the sheet and row number based on task ID.
- Integral to the time tracking and task management scripts.

## Setup Guide for Your New Work OS
- **Sheets Overview:** Includes `Content_Creation`, `Project_Management`, `Work_Hours`, `Daily Plan`, `Content Calendar`, `Ideas`, `Data_Validation`, and `Dump`.
- **Preparing Your Sheets:** Customize each sheet based on your needs – from tracking tasks in `Content_Creation` and `Project_Management` to managing tasks in the `Work_Hours` sheet.
- **Setting Up Scripts:** Dive into the Script editor in Google Sheets to integrate and tweak scripts like `automateNewTaskEntry` and `synchronizeStatuses`.
- **Customization:** Adjust columns, formulas, and scripts to suit your unique workflow.
- **Final Steps:** Test thoroughly, train your team, and regularly back up your data.

## A Call for Collaboration
I'm no developer; just a creative guy who loves to solve problems. This project is my baby, but it needs nurturing from folks like you – whether it's tweaking a script, suggesting a feature, or just sharing your thoughts.

## Let's Build Together!
- **Feedback & Ideas:** All are welcome! Let's make this tool better together.
- **Contribute:** If you've got a flair for scripts or an eye for efficiency, your expertise is invaluable.
- **Spread the Word:** If this tool eases your workflow, share the love with others.

## Licensing and Acknowledgements
- **Open and Accessible:** Under the MIT License for you to use and modify freely.
- **A Tip of the Hat to monday.com:** Thanks for the inspiration. Here's to community and collaboration!
