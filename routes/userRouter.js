const express = require("express");
const router = express.Router();
const { auth } = require("../middelwares/auth");
const { authAdmin } = require("../middelwares/authAdmin");
// const { uploadProfileImage } = require("../middelwares/multer");
const {
  userCart,
  getUserCart,
  createOrder,
  getOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getAllUsersInfo,
  getUser,
  updateUsersRole,
  deleteUser,
  getUserInfo,
  sendMessageToAdmin,
  getAllMessages,
  deleteMessage,
  editProfile,
} = require("../controllers/userController");
// const { uploadProfile } = require("../controllers/uploadImgController");

router.get("/info", auth, getUserInfo);
router.get("/all-info", auth, authAdmin, getAllUsersInfo);
router.get("/orders", auth, getOrders);
router.get("/orders/:id", auth, getOrder);
router.put("/orders/:id", auth, authAdmin, updateOrderStatus);
router.get("/all-orders", auth, authAdmin, getAllOrders);
router.get("/cart", auth, getUserCart);
router.post("/cart", auth, userCart);
router.post("/cart/cash-order", auth, createOrder);
router.patch("/update-role/:id", auth, authAdmin, updateUsersRole);
router.delete("/delete/:id", auth, authAdmin, deleteUser);
router.put("/edit-profile", auth, editProfile);
router.post("/send-to-admin", auth, sendMessageToAdmin);
router.get("/all-messages", auth, authAdmin, getAllMessages);
router.delete("/delete-message/:id", auth, authAdmin, deleteMessage);
router.get("/:id", auth, authAdmin, getUser);

module.exports = router;
