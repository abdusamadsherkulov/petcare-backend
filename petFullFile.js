//.env
MONGO_URI =
  'mongodb+srv://petcareAdmin:2896541Juice@petcare.gz3e3gl.mongodb.net/?retryWrites=true&w=majority&appName=petcare';
JWT_SECRET = 'supersecretkey';
GOOGLE_APPLICATION_CREDENTIALS = '../config/petcare-photo-195c5a91d401.json';

//petController.js
const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
const multer = require('multer');
const Pet = require('../models/Pet');

// Multer setup for file uploads
const upload = multer({dest: 'uploads/'});

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // your path
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const uploadFileToDrive = async (filePath, filename, mimetype) => {
  const driveService = google.drive({
    version: 'v3',
    auth: await auth.getClient(),
  });

  const fileMetadata = {name: filename};
  const media = {
    mimeType: mimetype,
    body: fs.createReadStream(filePath),
  };

  const response = await driveService.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });

  const fileId = response.data.id;

  // Make it public
  await driveService.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
  return fileUrl;
};

/// New route handler using file upload
const submitPetRehomingForm = async (req, res) => {
  try {
    const {name, species, breed, age, health, cost, reason, location, phone} =
      req.body;

    const uploadedPhotos = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const driveUrl = await uploadFileToDrive(
          file.path,
          file.originalname,
          file.mimetype
        );
        uploadedPhotos.push(driveUrl);
        fs.unlinkSync(file.path); // remove local file after uploading
      }
    }

    const pet = new Pet({
      owner: req.user.id,
      name,
      species,
      breed,
      age,
      health,
      cost,
      reason,
      location,
      phone,
      photos: uploadedPhotos,
    });

    await pet.save();
    res.status(201).json({message: 'Pet rehoming form submitted', pet});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};

// Get pets rehomed by current user
const getUserPets = async (req, res) => {
  try {
    const pets = await Pet.find({owner: req.user.id});
    res.status(200).json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};

module.exports = {
  submitPetRehomingForm,
  getUserPets,
  upload,
};

//Pet.js
const mongoose = require('mongoose');

const petSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {type: String, required: true},
    species: {type: String, required: true},
    breed: {type: String, required: true},
    age: {type: String, required: true},
    health: {type: String, required: true},
    cost: {
      type: String,
      required: true, // Optional field, won't break existing data
      default: 0,
    },
    reason: {type: String, required: true},
    location: {type: String, required: true},
    phone: {type: String, required: true},
    photos: [String], // Store Google Drive image URLs
    status: {
      type: String,
      enum: ['Available', 'Adopted', 'Pending'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;

//petRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitPetRehomingForm,
  getUserPets,
  upload,
} = require('../controllers/petController');
const protect = require('../middleware/authMiddleware');

router.post(
  '/rehoming',
  protect,
  upload.array('photos', 5),
  submitPetRehomingForm
);
router.get('/my-pets', protect, getUserPets);

module.exports = router;

//driveUploader.js
const fs = require('fs');
const {google} = require('googleapis');
const path = require('path');

//Auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/credentials.json'), // 🔑 Your service account JSON file
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

//server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const petRoutes = require('./routes/petRoutes');

const app = express();

dotenv.config();
connectDB();

// ✅ Enable CORS BEFORE routes
app.use(cors());

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

// ✅ Example test route
app.get('/api/test', (req, res) => {
  res.json({message: 'CORS is enabled!'});
});

// ✅ Start server (ONLY ONCE)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
