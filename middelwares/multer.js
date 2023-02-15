const multer = require("multer");
// const DIRPROFILECLIENT = "../client/public/images/profile";
const DIRPROFILEADMIN = "./public/images/profile";
const DIRPRODUCTADMIN = "./public/images/products";
// const DIRPRODUCTCLIENT = "../client/public/images/products";
const storageProfileImage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, DIRPROFILECLIENT);
    cb(null, DIRPROFILEADMIN);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, fileName);
  },
});
const storageProductImage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, DIRPRODUCTCLIENT);
    cb(null, DIRPRODUCTADMIN);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, fileName);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype !== "image/png" &&
    file.mimetype !== "image/jpg" &&
    file.mimetype !== "image/jpeg"
  )
    cb("Incompatible format");
  else cb(null, true);
};
const uploadProfileImage = multer({
  storage: storageProfileImage,
  fileFilter,
  limits: { fileSize: 500000 },
}).single("image");
const uploadProductImage = multer({
  storage: storageProductImage,
  fileFilter,
  limits: { fileSize: 500000 },
}).single("image");
module.exports = {
  uploadProfileImage,
  uploadProductImage,
};
