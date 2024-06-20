const multer = require('multer')
const path = require('path')
const singleImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(__dirname, ".." + process.env.IMGURL));
      //for docker
      // callback(null, "/public/images");
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname);
    },
  }),

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|JPG|PNG|JPEG)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
}).single("imageName",);
module.exports = singleImage
  