const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const { Readable } = require('stream');

// Настройка Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // путь к JSON-ключу
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  },
});

// Создание папки для профессионала
const createProfessionalFolder = async (professionalId, professionalName) => {
  try {
    const folderMetadata = {
      name: `Professional_${professionalId}_${professionalName}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID],
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    // Делаем папку публично доступной для просмотра
    await drive.permissions.create({
      fileId: folder.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error creating professional folder:', error);
    throw new Error('Failed to create professional folder in Google Drive');
  }
};

// Загрузка файла в Google Drive
const uploadToGoogleDrive = async (file, professionalId, professionalName) => {
  try {
    // Создаем или получаем папку профессионала
    let folderId = await getProfessionalFolderId(professionalId);
    if (!folderId) {
      folderId = await createProfessionalFolder(professionalId, professionalName);
    }

    const fileMetadata = {
      name: `${Date.now()}-${file.originalname}`,
      parents: [folderId],
    };

    // Создаем поток из буфера
    const stream = Readable.from(file.buffer);

    const media = {
      mimeType: file.mimetype,
      body: stream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Делаем файл публично доступным
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
};

// Получение ID папки профессионала
const getProfessionalFolderId = async (professionalId) => {
  try {
    const response = await drive.files.list({
      q: `name contains 'Professional_${professionalId}_' and mimeType='application/vnd.google-apps.folder' and '${process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    return response.data.files[0]?.id || null;
  } catch (error) {
    console.error('Error getting professional folder:', error);
    return null;
  }
};

// Удаление файла из Google Drive
const deleteFromGoogleDrive = async (fileId) => {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    throw new Error('Failed to delete file from Google Drive');
  }
};

// Удаление папки профессионала и всех файлов в ней
const deleteProfessionalFolder = async (professionalId) => {
  try {
    const folderId = await getProfessionalFolderId(professionalId);
    if (folderId) {
      // Получаем все файлы в папке
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id)',
      });

      // Удаляем все файлы
      for (const file of response.data.files) {
        await drive.files.delete({
          fileId: file.id,
        });
      }

      // Удаляем саму папку
      await drive.files.delete({
        fileId: folderId,
      });
    }
  } catch (error) {
    console.error('Error deleting professional folder:', error);
    throw new Error('Failed to delete professional folder from Google Drive');
  }
};

// Создание нового файла чата
const createNewChatFile = async (folderId) => {
  const fileMetadata = {
    name: `chat_${Date.now()}.json`,
    parents: [folderId],
    mimeType: 'application/json',
  };

  const media = {
    mimeType: 'application/json',
    body: JSON.stringify([], null, 2),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  return file.data.id;
};

// Сохранение истории чата в Google Drive
const saveChatHistory = async (userId, question, answer, isNewChat = false) => {
  try {
    // Создаем или получаем папку для истории чата пользователя
    const folderName = `chat_history_${userId}`;
    let folderId = await getOrCreateChatFolder(folderName);

    let fileId;
    let chatData = [];

    if (!isNewChat) {
      // Ищем последний файл чата в папке
      const response = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
        orderBy: 'createdTime desc',
        pageSize: 1,
        fields: 'files(id, name)',
      });

      if (response.data.files.length > 0) {
        // Если файл существует, получаем его содержимое
        const file = response.data.files[0];
        fileId = file.id;
        
        const fileResponse = await drive.files.get({
          fileId: fileId,
          alt: 'media',
        });
        
        // Проверяем, является ли ответ строкой или уже объектом
        const parsedData = typeof fileResponse.data === 'string' 
          ? JSON.parse(fileResponse.data)
          : fileResponse.data;

        // Убеждаемся, что chatData является массивом
        chatData = Array.isArray(parsedData) ? parsedData : [parsedData];
      }
    }

    // Если это новый чат или файл не найден, создаем новый файл
    if (isNewChat || !fileId) {
      fileId = await createNewChatFile(folderId);
    }

    // Добавляем новое сообщение
    chatData.push({
      timestamp: new Date().toISOString(),
      question,
      answer
    });

    // Обновляем файл
    await drive.files.update({
      fileId: fileId,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(chatData, null, 2),
      },
    });

    return fileId;
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw new Error('Failed to save chat history to Google Drive');
  }
};

// Получение или создание папки для истории чата
const getOrCreateChatFolder = async (folderName) => {
  try {
    // Ищем папку
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Если папка не найдена, создаем новую
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID],
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error finding/creating chat folder:', error);
    throw new Error('Failed to find or create chat folder in Google Drive');
  }
};

// Получение истории чата из Google Drive
const getChatHistory = async (userId) => {
  try {
    // Получаем ID папки с историей чата
    const folderName = `chat_history_${userId}`;
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length === 0) {
      return []; // Возвращаем пустой массив, если папка не найдена
    }

    const folderId = response.data.files[0].id;

    // Получаем все файлы в папке
    const filesResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      orderBy: 'createdTime desc',
      fields: 'files(id, name, createdTime)',
    });

    // Получаем содержимое каждого файла
    const chatHistory = await Promise.all(
      filesResponse.data.files.map(async (file) => {
        try {
          const fileResponse = await drive.files.get({
            fileId: file.id,
            alt: 'media',
          });
          
          // Проверяем, является ли ответ строкой или уже объектом
          const fileData = typeof fileResponse.data === 'string' 
            ? JSON.parse(fileResponse.data)
            : fileResponse.data;

          return {
            id: file.id,
            timestamp: file.createdTime,
            ...fileData
          };
        } catch (fileError) {
          console.error(`Error processing file ${file.id}:`, fileError);
          return null; // Пропускаем файлы с ошибками
        }
      })
    );

    // Фильтруем null значения и сортируем по времени
    return chatHistory
      .filter(chat => chat !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw new Error('Failed to get chat history from Google Drive');
  }
};

module.exports = {
  upload,
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
  deleteProfessionalFolder,
  saveChatHistory,
  getChatHistory,
}; 