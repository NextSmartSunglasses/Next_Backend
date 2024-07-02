// videoController.js
const Video = require('../../models/video');

const uploadVideo = async (req, res) => {
  try {
    const { name, userId } = req.body;
    const newVideo = new Video({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      user: userId,
    });

    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading video:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getVideos = async (req, res) => {
  try {
    const userId = req.user._id;
    const videos = await Video.find({ user: userId });

    const videosWithBase64 = videos.map(video => ({
      name: video.name,
      data: video.data.toString('base64'),
      contentType: video.contentType,
      uploadedAt: video.uploadedAt,
    }));

    res.status(200).json(videosWithBase64);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadVideo,
  getVideos
};
