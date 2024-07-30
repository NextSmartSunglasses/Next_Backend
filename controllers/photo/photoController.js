const ExifImage = require('exif').ExifImage;
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const jsQR = require('jsqr'); // Ensure jsQR is installed and imported correctly
const Photo = require('../../models/photo');
const PNG = require('png-js'); // Add this line
const { exec } = require('child_process');


const uploadPhoto = async (req, res) => {
  try {
    let metadata = {};
    let extractedText = '';
    let qrCodeData = '';

    // Extract EXIF data
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

    // Extract text from image
    try {
      const processedImage = await preprocessImage(req.file.buffer);
      extractedText = await extractTextFromImage(processedImage);
    } catch (error) {
      console.error('Error extracting text from image:', error.message);
    }

    // Decode QR code from image
    try {
      // Convert image buffer to PNG format
      const pngBuffer = await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside' })
        .png()
        .toBuffer();

      // Parse the PNG buffer using png-js
      const png = new PNG(pngBuffer);
      png.decode((pixels) => {
        const qrCodeResult = jsQR(pixels, png.width, png.height);
        qrCodeData = qrCodeResult ? qrCodeResult.data : 'No QR code detected';

        // Save the photo
        const { name, userId } = req.body;
        const newPhoto = new Photo({
          name: req.file.originalname,
          data: req.file.buffer,
          contentType: req.file.mimetype,
          user: userId,
          metadata: metadata,
          extractedText: extractedText,
          qrCodeData: qrCodeData
        });

        newPhoto.save()
          .then(() => {
            res.status(201).json({ message: 'Photo uploaded successfully!', metadata: metadata, extractedText: extractedText, qrCodeData: qrCodeData });
          })
          .catch((error) => {
            console.error('Error uploading photo:', error.message);
            res.status(500).json({ error: 'Internal server error' });
          });
      });
    } catch (error) {
      console.error('Error extracting QR code data:', error.message);
    }
  } catch (error) {
    console.error('Error uploading photo:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const preprocessImage = async (imageBuffer) => {
  try {
    // Define minimum width and height
    const minWidth = 300;
    const minHeight = 300;

    // Get image metadata (width and height)
    const { width, height } = await sharp(imageBuffer).metadata();

    // Determine resize dimensions
    const resizeWidth = width < minWidth ? minWidth : width;
    const resizeHeight = height < minHeight ? minHeight : height;

    // Process the image
    const processedImage = await sharp(imageBuffer)
      .resize({
        width: resizeWidth,
        height: resizeHeight,
        fit: 'inside', // Maintain aspect ratio
      })
      .grayscale()
      .normalize()
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
      'eng+fra', // List all languages if needed
      {
        logger: m => console.log(m),
        oem: 3, // OCR Engine Mode: 3 (default, both standard and LSTM OCR)
        psm: 6  // Page Segmentation Mode: 6 (Assume a single uniform block of text)
      }
    );
    return text;
  } catch (error) {
    console.error('Error processing the image:', error);
    throw error;
  }
};

const getPhotos = async (req, res) => {
  try {
    const userId = req.user._id;
    const photos = await Photo.find({ user: userId });

    const photosWithBase64 = photos.map(photo => ({
      name: photo.name,
      data: photo.data ? photo.data.toString('base64') : '', // Ensure data is base64 encoded
      contentType: photo.contentType,
      uploadedAt: photo.uploadedAt,
    }));

    res.status(200).json(photosWithBase64);
  } catch (err) {
    console.error('Error retrieving photos:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getPhotosWithText = async (req, res) => {
  try {
    const userId = req.user._id;
    const photos = await Photo.find({ user: userId });

    const photosWithText = photos.map(photo => ({
      name: photo.name,
      data: photo.data ? photo.data.toString('base64') : '',
      contentType: photo.contentType,
      metadata: photo.metadata,
      extractedText: photo.extractedText || '',
      qrCodeData: photo.qrCodeData || '',
    }));

    res.status(200).json(photosWithText);
  } catch (error) {
    console.error('Error retrieving photos:', error.message);
    res.status(500).json({ error: 'Internal server error' });
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

const uploadScannedQRCode = async (req, res) => {
  try {
    const { qrCodeData, userId } = req.body;

    const newQRCode = new Photo({
      name: 'Scanned QR Code',
      qrCodeData: qrCodeData,
      user: userId,
    });

    await newQRCode.save();
    res.status(201).json({ message: 'QR Code saved successfully!', qrCodeData: qrCodeData });
  } catch (error) {
    console.error('Error saving QR code:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadPhoto,
  getPhotos,
  getPhotosWithText,
  uploadPhotoForTextExtraction,
  uploadScannedQRCode,
  extractTextFromImage
};
