const express = require("express");
const router = express.Router();
const {
  registerUser,
  activeEmail,
  loginUser,
  getAccessToken,
  forgotPassword,
  resetPassword,
  logOutUser,
  loginAdmin,
  forgotPasswordAdmin,
} = require("../controllers/authController");
const { auth } = require("../middelwares/auth");

router.post("/register", registerUser);
router.post("/activation", activeEmail);
router.post("/login", loginUser);
router.get("/refresh-token", getAccessToken);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", auth, resetPassword);
router.post("/logout", auth, logOutUser);
router.post("/login-admin", loginAdmin);
router.post("/forgot-password-admin", forgotPasswordAdmin);

module.exports = router;
