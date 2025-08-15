# System Settings: Backup & Recovery (Deprecated)

**Note:** The dedicated UI for managing backups has been deprecated in the current application structure. Backup and recovery procedures are now handled at the infrastructure level.

This document describes the intended functionality of the previously planned Backup & Recovery section.

---

The **Backup & Recovery** section provides critical tools for data protection and disaster recovery, ensuring business continuity.

## Key Features

### 1. Create Backup
- **Purpose**: To manually create an immediate snapshot of the system's data.
- **Functionality**: A one-click action that initiates a full backup of the application's database. This is useful before performing major system updates or data migrations.

### 2. Restore from Backup
- **Purpose**: To revert the system's data to a previous state from a saved backup point.
- **Functionality**: Displays a list of available backups and allows administrators to select one to restore. This is a critical function for recovering from data loss or corruption.

### 3. Scheduled Backups
- **Purpose**: To automate the data backup process.
- **Functionality**: An interface to configure automated backup schedules (e.g., daily, weekly). This ensures that data is consistently backed up without manual intervention, forming the core of the disaster recovery strategy.