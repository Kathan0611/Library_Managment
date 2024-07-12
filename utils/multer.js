const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file)
    cb(null, 'uploads/')

  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const fileFilter = function (req, file, cb) {
       console.log(file.originalname)
  if (file.mimetype === 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'application/pdf' || file.mimetype == 'video/mp4') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG image files are allowed!'), false);
  }
}
const upload = multer({ storage: storage,fileFilter: fileFilter })

module.exports = upload;