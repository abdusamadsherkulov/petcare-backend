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
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS), // your path
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

const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({status: 'Available'}); // Only show available pets
    res.status(200).json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};

const deletePet = async (req, res) => {
  try {
    const petId = req.params.petId;
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({message: 'Pet not found'});
    }

    // Check if the user owns the pet
    if (pet.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({message: 'You can only delete your own pets'});
    }

    await Pet.findByIdAndDelete(petId);
    res.status(200).json({message: 'Pet deleted successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};

const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({message: 'Pet not found'});
    }
    res.status(200).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};

module.exports = {
  submitPetRehomingForm,
  getUserPets,
  getAllPets,
  getPetById,
  deletePet,
  upload,
};
