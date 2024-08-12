const express = require('express');
const multer = require('multer');
const photoController = require('./photoController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = (db, jwt, errors, utils) => {
  const router = express.Router();
  const jsonverify = require('../../middlewares/jsonverify')(db, jwt, errors, utils);

  // Route for uploading photo (without authentication)
  router.post('/upload', upload.single('photo'), photoController.uploadPhoto);

  // Route for viewing user's photos (with authentication)
  router.get('/photos/user', jsonverify, photoController.getPhotos);

  // Routes for text extraction
  router.post('/uploadForText', upload.single('photo'), photoController.uploadPhotoForTextExtraction);
  router.get('/photos/texts/user', jsonverify, photoController.getPhotosWithText);
// ... other imports
router.delete('/photos/name/:photoName', jsonverify, photoController.deletePhotoByName);

  // Route for saving scanned QR code
  router.post('/uploadScannedQRCode', jsonverify, photoController.uploadScannedQRCode); // Ensure this route uses jsonverify

  return router;
};
