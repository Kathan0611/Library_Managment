const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file)
    cb(null, 'uploads/')

  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const fileFilter = function (req, file, cb) {

  if (file.mimetype === 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG image files are allowed!'), false);
  }
}
const upload = multer({ storage: storage, limits: { fileSize: 2000000 }, fileFilter: fileFilter })

module.exports = upload;