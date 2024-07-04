const ExifImage = require('exif').ExifImage;
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const Photo = require('../../models/photo');

const uploadPhoto = async (req, res) => {
  try {
    let metadata = {};
    let extractedText = '';

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

    try {
      const processedImage = await preprocessImage(req.file.buffer);
      extractedText = await extractTextFromImage(processedImage);
    } catch (error) {
      console.error('Error extracting text from image:', error.message);
    }

    const { name, userId } = req.body;
    const newPhoto = new Photo({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      user: userId,
      metadata: metadata,
      extractedText: extractedText
    });

    await newPhoto.save();
    res.status(201).json({ message: 'Photo uploaded successfully!', metadata: metadata, extractedText: extractedText });
  } catch (error) {
    console.error('Error uploading photo:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const preprocessImage = async (imageBuffer) => {
  try {
    const processedImage = await sharp(imageBuffer)
      .grayscale()
      .sharpen()
      .threshold()
      .toBuffer();
    return processedImage;
  } catch (error) {
    console.error('Error processing the image:', error);
    throw error;
  }
};

const extractTextFromImage = async (imageBuffer) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => console.log(m) // Log progress
      }
    );
    return text;
  } catch (error) {
    console.error('Error processing the image:', error);
    throw error;
  }
};

const getExtractedTexts = async (req, res) => {
  try {
    const userId = req.user._id;
    const photos = await Photo.find({ user: userId });

    const texts = photos.map(photo => ({
      name: photo.name,
      extractedText: photo.extractedText,
      uploadedAt: photo.uploadedAt,
    }));

    res.status(200).json(texts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPhotos = async (req, res) => {
  try {
    const userId = req.user._id;
    const photos = await Photo.find({ user: userId, isTextPhoto: false });

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

const uploadPhotoForTextExtraction = async (req, res) => {
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

    const { name, userId } = req.body;

    const newPhoto = new Photo({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      user: userId,
      metadata: metadata
    });

    const processedImage = await preprocessImage(req.file.buffer);
    const { data: { text } } = await Tesseract.recognize(processedImage, 'eng');

    newPhoto.extractedText = text;
    await newPhoto.save();

    const base64Image = req.file.buffer.toString('base64');
    res.status(201).json({ message: 'Photo uploaded and text extracted successfully!', extractedText: text, image: base64Image });
  } catch (error) {
    console.error('Error uploading photo:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPhotosWithText = async (req, res) => {
  try {
    const userId = req.user._id;
    const photos = await Photo.find({ user: userId });

    const photosWithBase64 = photos.map(photo => ({
      name: photo.name,
      data: photo.data.toString('base64'),
      contentType: photo.contentType,
      uploadedAt: photo.uploadedAt,
      extractedText: photo.extractedText,
    }));

    res.status(200).json(photosWithBase64);
  } catch (err) {
    res.status500.json({ message: err.message });
  }
};

module.exports = {
  uploadPhoto,
  getPhotos,
  getExtractedTexts,
  uploadPhotoForTextExtraction,
  getPhotosWithText
};
