//driveUploader.js
const fs = require('fs');
const {google} = require('googleapis');
const path = require('path');

// Auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/petcare-photo-195c5a91d401.json'), // 🔑 Your service account JSON file
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const uploadToDrive = async file => {
  const drive = google.drive({version: 'v3', auth: await auth.getClient()});

  const fileMetadata = {
    name: file.originalname,
    parents: ['YOUR_FOLDER_ID'], // Replace with your Google Drive folder ID (optional)
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  // Make file public
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Clean up local temp file
  fs.unlinkSync(file.path);

  // Return public URL
  return `https://drive.google.com/uc?id=${response.data.id}&export=view`;
};

module.exports = uploadToDrive;
