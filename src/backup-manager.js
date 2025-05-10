const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

/**
 * Manages file backups for the duq CLI
 */
class BackupManager {
    constructor() {
        // Create a central backup directory in the user's home directory
        this.backupDir = path.join(os.homedir(), '.duq', 'backups');
        this.indexFile = path.join(os.homedir(), '.duq', 'backup-index.json');

        // Ensure the backup directory exists
        fs.ensureDirSync(this.backupDir);

        // Load or initialize the backup index
        this.loadIndex();
    }

    /**
     * Load the backup index from disk or create a new one
     */
    loadIndex() {
        try {
            if (fs.existsSync(this.indexFile)) {
                this.index = JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
            } else {
                this.index = {
                    files: {},
                    history: []
                };
                this.saveIndex();
            }
        } catch (error) {
            console.error(`Error loading backup index: ${error.message}`);
            this.index = {
                files: {},
                history: []
            };
        }
    }

    /**
     * Save the backup index to disk
     */
    saveIndex() {
        try {
            fs.ensureDirSync(path.dirname(this.indexFile));
            fs.writeFileSync(this.indexFile, JSON.stringify(this.index, null, 2), 'utf8');
        } catch (error) {
            console.error(`Error saving backup index: ${error.message}`);
        }
    }

    /**
     * Create a backup of a file
     * @param {string} filePath - Path to the file to backup
     * @param {string} operation - The operation being performed (e.g., 'docstrings', 'refactor')
     * @returns {string} - The ID of the backup
     */
    createBackup(filePath, operation) {
        try {
            const absolutePath = path.resolve(filePath);

            // Generate a unique ID for this backup
            const timestamp = new Date().toISOString();
            const fileHash = crypto.createHash('md5').update(absolutePath).digest('hex');
            const backupId = `${fileHash}-${timestamp}`;

            // Create the backup file path
            const backupPath = path.join(this.backupDir, backupId);

            // Copy the file to the backup location
            fs.copySync(absolutePath, backupPath);

            // Update the index
            if (!this.index.files[absolutePath]) {
                this.index.files[absolutePath] = [];
            }

            // Add to file's history
            this.index.files[absolutePath].unshift({
                id: backupId,
                timestamp,
                operation
            });

            // Add to global history
            this.index.history.unshift({
                id: backupId,
                filePath: absolutePath,
                timestamp,
                operation
            });

            // Limit history to last 100 entries
            if (this.index.history.length > 100) {
                this.index.history = this.index.history.slice(0, 100);
            }

            // Limit per-file history to last 10 entries
            if (this.index.files[absolutePath].length > 10) {
                // Get IDs of backups to remove
                const toRemove = this.index.files[absolutePath].slice(10);

                // Remove the backup files
                toRemove.forEach(backup => {
                    try {
                        fs.removeSync(path.join(this.backupDir, backup.id));
                    } catch (e) {
                        // Ignore errors when removing old backups
                    }
                });

                // Trim the array
                this.index.files[absolutePath] = this.index.files[absolutePath].slice(0, 10);
            }

            // Save the updated index
            this.saveIndex();

            return backupId;
        } catch (error) {
            console.error(`Error creating backup: ${error.message}`);
            return null;
        }
    }

    /**
     * Restore a file from backup
     * @param {string} filePath - Path to the file to restore (or null for most recent)
     * @param {string} backupId - Specific backup ID to restore (or null for most recent)
     * @returns {boolean} - Whether the restore was successful
     */
    restoreBackup(filePath = null, backupId = null) {
        try {
            let backupToRestore;

            if (filePath) {
                const absolutePath = path.resolve(filePath);

                // Check if we have backups for this file
                if (!this.index.files[absolutePath] || this.index.files[absolutePath].length === 0) {
                    console.error(`No backups found for ${absolutePath}`);
                    return false;
                }

                if (backupId) {
                    // Find the specific backup
                    backupToRestore = this.index.files[absolutePath].find(b => b.id === backupId);
                    if (!backupToRestore) {
                        console.error(`Backup ID ${backupId} not found for ${absolutePath}`);
                        return false;
                    }
                } else {
                    // Use the most recent backup for this file
                    backupToRestore = this.index.files[absolutePath][0];
                }
            } else {
                // No file specified, use the most recent backup from history
                if (this.index.history.length === 0) {
                    console.error('No backup history found');
                    return false;
                }

                backupToRestore = this.index.history[0];
                filePath = backupToRestore.filePath;
            }

            // Check if the backup file exists
            const backupPath = path.join(this.backupDir, backupToRestore.id);
            if (!fs.existsSync(backupPath)) {
                console.error(`Backup file not found: ${backupPath}`);
                return false;
            }

            // Check if the target file exists
            if (!fs.existsSync(filePath)) {
                console.error(`Target file no longer exists: ${filePath}`);
                return false;
            }

            // Copy the backup back to the original location
            fs.copySync(backupPath, filePath);

            return {
                filePath,
                timestamp: backupToRestore.timestamp,
                operation: backupToRestore.operation
            };
        } catch (error) {
            console.error(`Error restoring backup: ${error.message}`);
            return false;
        }
    }

    /**
     * List available backups for a file
     * @param {string} filePath - Path to the file
     * @returns {Array} - Array of backup information
     */
    listBackups(filePath = null) {
        try {
            if (filePath) {
                const absolutePath = path.resolve(filePath);
                return this.index.files[absolutePath] || [];
            } else {
                return this.index.history;
            }
        } catch (error) {
            console.error(`Error listing backups: ${error.message}`);
            return [];
        }
    }
}

module.exports = new BackupManager();
