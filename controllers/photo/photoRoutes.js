const express = require('express');
const multer = require('multer');
const photoController = require('./photoController');
const videoController = require('./videoController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = (db, jwt, errors, utils) => {
    const router = express.Router();
    const jsonverify = require('../../middlewares/jsonverify')(db, jwt, errors, utils); // Adjust as necessary

    // Route for uploading photo (without authentication)
    router.post('/upload', upload.single('photo'), photoController.uploadPhoto);

    // Route for viewing user's photos (with authentication)
    router.get('/photos/user', jsonverify, photoController.getPhotos); // Ensure jsonverify is correctly imported and used
    router.post('/uploadVideo', upload.single('video'), videoController.uploadVideo);
    router.get('/videos/user', jsonverify, videoController.getVideos);

    // Routes for text extraction
    router.post('/uploadForText', upload.single('photo'), photoController.uploadPhotoForTextExtraction);
    router.get('/photos/texts/user', jsonverify, photoController.getPhotosWithText);

    return router;
};
