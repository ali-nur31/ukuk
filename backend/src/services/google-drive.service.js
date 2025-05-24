const { google } = require('googleapis');
const path = require('path');

class GoogleDriveService {
    constructor() {
        this.auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, '../../credentials/client_secret.json'),
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        this.drive = google.drive({ version: 'v3', auth: this.auth });
    }

    async saveChatHistory(userId, question, answer) {
        try {
            const folderName = `chat_history_${userId}`;
            
            // Создаем или находим папку для пользователя
            let folderId = await this.findOrCreateFolder(folderName);
            
            // Создаем файл с историей чата
            const fileMetadata = {
                name: `chat_${Date.now()}.json`,
                parents: [folderId],
                mimeType: 'application/json',
            };

            const chatData = {
                timestamp: new Date().toISOString(),
                question,
                answer
            };

            const media = {
                mimeType: 'application/json',
                body: JSON.stringify(chatData, null, 2),
            };

            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            return file.data.id;
        } catch (error) {
            console.error('Error saving chat history:', error);
            throw error;
        }
    }

    async findOrCreateFolder(folderName) {
        try {
            // Ищем папку
            const response = await this.drive.files.list({
                q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            }

            // Если папка не найдена, создаем новую
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };

            const folder = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id',
            });

            return folder.data.id;
        } catch (error) {
            console.error('Error finding/creating folder:', error);
            throw error;
        }
    }
}

module.exports = new GoogleDriveService(); 