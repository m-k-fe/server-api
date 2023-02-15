const User = require("../models/userModel");

const authAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (user.role != "admin") {
      res.status(500);
      throw new Error("Admin resources access denied");
    }
    next();
  } catch (err) {
    res.json({ message: err.message });
  }
};

module.exports = {
  authAdmin,
};
