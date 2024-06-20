const ExifImage = require('exif').ExifImage;
const Photo = require('../../models/photo');

const uploadPhoto = async (req, res) => {
  try {
    let metadata = {};
    try {
      const exifData = await new Promise((resolve, reject) => {
        new ExifImage({ image: req.file.buffer }, (error, exifData) => {
          if (error) reject(error);
          else resolve(exifData);
        });
      });
      metadata = exifData;
    } catch (error) {
      console.error('Error reading EXIF data:', error.message);
    }

    const { name, userId } = req.body; // Assuming userId is passed in the request body
    const newPhoto = new Photo({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      user: userId, // Associate the photo with the user ID
      metadata: metadata
    });

    await newPhoto.save();
    res.status(201).json({ message: 'Photo uploaded successfully!', metadata: metadata });
  } catch (error) {
    console.error('Error uploading photo:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPhotos = async (req, res) => {
  try {
    const userId = req.user._id; // Retrieve user ID from the authenticated user
    const photos = await Photo.find({ user: userId });

    const photosWithBase64 = photos.map(photo => ({
      name: photo.name,
      data: photo.data.toString('base64'),
      contentType: photo.contentType,
      uploadedAt: photo.uploadedAt,
    }));

    res.status(200).json(photosWithBase64);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadPhoto,
  getPhotos
};
