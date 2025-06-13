const fs = require('fs-extra');
const { exec } = require('child_process');
const archiver = require('archiver');
const path = require('path');

class Backup {
    constructor() {
        this.ROOT_BACKUP_DIR = path.resolve(__dirname, '../../backups');
        this.DB_BACKUP_PATH = path.join(this.ROOT_BACKUP_DIR, 'db');
        this.FILE_SYSTEM_BACKUP_PATH = path.join(this.ROOT_BACKUP_DIR, 'filesystem');

        this.DB_NAME = process.env.DB_NAME;
        this.DB_USER = process.env.DB_USER;
        this.DB_PASSWORD = process.env.DB_PASSWORD;

        try {
            fs.ensureDirSync(this.DB_BACKUP_PATH);
            fs.ensureDirSync(this.FILE_SYSTEM_BACKUP_PATH);
        } catch (err) {
            console.error('Error creating backup directories:', err);
        }
    }

    backupDatabase(timestamp, callback) {
        const backupFile = path.join(this.DB_BACKUP_PATH, `backup_${timestamp}.sql`);
        const command = `"C:\\Program Files\\PostgreSQL\\9.4\\bin\\pg_dump" -U ${this.DB_USER} -d ${this.DB_NAME}`;

        const childProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing pg_dump: ${error}`);
                console.error(stderr);
                return callback(error);
            }

            fs.writeFile(backupFile, stdout, (err) => {
                if (err) {
                    console.error(`Error writing backup file: ${err}`);
                    return callback(err);
                }
                console.log(`Database backup created: ${backupFile}`);
                callback(null, backupFile);
            });
        });

        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
    }

    backupFileSystem(databaseBackupPath, archivePath, callback) {
        const srcDir = path.resolve(__dirname, '../..');
        const output = fs.createWriteStream(archivePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`File system backup created: ${archivePath}`);
            callback(null, archivePath);
        });

        archive.on('error', (err) => {
            console.error(`Error archiving files: ${err}`);
            callback(err);
        });

        archive.pipe(output);

        const databaseBackupName = path.basename(databaseBackupPath);
        archive.file(databaseBackupPath, { name: databaseBackupName });

        archive.glob('**/*', {
            cwd: srcDir,
            ignore: ['backups/**', 'node_modules/**', '.git/**']
        });

        archive.finalize();
    }

    performBackup(req, res) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];
        const archiveFileName = `backup_${timestamp}.zip`;
        const archivePath = path.join(this.FILE_SYSTEM_BACKUP_PATH, archiveFileName); // ⬅ изменено

        this.backupDatabase(timestamp, (err, dbBackupPath) => {
            if (err) {
                console.error('Error creating database backup:', err);
                return res.status(500).send('Error creating database backup');
            }

            this.backupFileSystem(dbBackupPath, archivePath, (err, fsBackupPath) => {
                if (err) {
                    console.error('Error creating file system backup:', err);
                    return res.status(500).send('Error creating file system backup');
                }

                return res.status(200).json({
                    message: 'Successful backup',
                    downloadUrl: `${process.env.NGROK_DOMAIN}/backup/download?file=${encodeURIComponent(archiveFileName)}`,
                });
            });
        });
    }

    downloadBackup(req, res) {
        const fileName = req.query.file;
        if (!fileName) {
            return res.status(400).send('Missing file name');
        }

        const filePath = path.join(this.FILE_SYSTEM_BACKUP_PATH, fileName);
        if (fs.existsSync(filePath)) {
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error downloading backup:', err);
                    res.status(500).send('Error downloading backup');
                }
            });
        } else {
            res.status(404).send('Backup file not found');
        }
    }
}

module.exports = new Backup();


