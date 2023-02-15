const fs = require("fs");
const User = require("../models/userModel");
const uploadProfile = async (req, res) => {
  const { username } = req.body;
  let fileType = req.file.mimetype.split("/")[1];
  let newFileName = `${username}.${fileType}`;
  fs.rename(
    `./public/images/profile/${req.file.filename}`,
    `./public/images/profile/${newFileName}`,
    function () {
      console.log("Callback");
    }
  );
  // fs.rename(
  //   `../client/public/images/profile/${req.file.filename}`,
  //   `../client/public/images/profile/${newFileName}`,
  //   function () {
  //     console.log("Callback");
  //   }
  // );
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $set: { image: `/images/profile/${newFileName}` } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select("-password");
    res.status(200).json(user);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
};
module.exports = {
  uploadProfile,
};
