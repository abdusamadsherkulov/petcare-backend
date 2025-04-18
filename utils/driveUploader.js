//driveUploader.js
const fs = require('fs');
const {google} = require('googleapis');
const path = require('path');

// Auth
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const uploadToDrive = async file => {
  const drive = google.drive({version: 'v3', auth: await auth.getClient()});

  const fileMetadata = {
    name: file.originalname,
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
