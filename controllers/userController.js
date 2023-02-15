const uniqid = require("uniqid");
const bcrypt = require("bcrypt");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Message = require("../models/messageModel");

const userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const { _id } = req.user;
    const user = await User.findOne({ _id });
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    let products = [];
    if (alreadyExistCart) await alreadyExistCart.remove();
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.qty = cart[i].qty;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].qty;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.status(202).json(newCart);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const { _id } = req.user;
    const cart = await Cart.findOne({ orderby: _id }).populate({
      path: "products",
      populate: {
        path: "product",
      },
    });
    res.status(202).json(cart);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { paymentInfo, method } = req.body;
    const { _id } = req.user;
    if (!method) {
      res.status(403);
      throw new Error("Create cash order failed");
    }
    const user = await User.findOne({ _id });
    const userCart = await Cart.findOne({ orderby: user?._id });
    let finalAmount = 0;
    if (userCart.totalAfterDiscount)
      finalAmount = userCart.totalAfterDiscount * 100;
    else finalAmount = userCart.cartTotal * 100;
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        paymentInfo,
        method,
        amount: finalAmount,
        status: method === "cod" ? "Processing" : "Delivred",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user?._id,
      orderStatus: paymentInfo.method === "cod" ? "Processing" : "Delivred",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { count: -item.qty } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.status(202).json(updated);
  } catch (err) {
    res.json({ message: err.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { _id } = req.user;
    const userOrders = await Order.find({ orderby: _id });
    res.status(202).json(userOrders);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id });
    res.status(202).json(order);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({});
    res.status(202).json(allOrders);
  } catch (err) {
    res.status(402).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id });
    const paymentIntent = order.paymentIntent;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          ...paymentIntent,
          status,
        },
      },
      { new: true }
    );
    res.status(201).json(updatedOrder);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getAllUsersInfo = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(202).json(users);
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    res.status(202).json(user);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

const updateUsersRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await User.findByIdAndUpdate(id, { role });
    res.status(203).json({ message: "Update Success" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(201).json({ message: "Deleted success!!" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const sendMessageToAdmin = async (req, res) => {
  try {
    const { name, email, object, msg } = req.body;
    if (!name || !email || !object || !msg) {
      res.status(402);
      throw new Error("Please add all fields");
    }
    const isExistUser = await User.findOne({ email });
    if (!isExistUser) {
      res.json(403);
      throw new Error("Email dosen't exist");
    }
    const message = await Message.create({
      name,
      email,
      object,
      msg,
    });
    res.status(202).json(message);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({});
    res.status(202).json(messages);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(202).json({ message: "Delete Successfully" });
  } catch (err) {
    res.status(402).json({ message: err.message });
  }
};

const editProfile = async (req, res) => {
  try {
    let hashedPassword;
    let user;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(req.body.password, salt);
      user = await User.findByIdAndUpdate(
        req.user._id,
        { ...req.body, password: hashedPassword },
        {
          new: true,
        }
      );
    } else {
      user = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
      });
    }
    res.status(201).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports = {
  userCart,
  getUserCart,
  createOrder,
  getOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getUserInfo,
  getAllUsersInfo,
  getUser,
  updateUsersRole,
  deleteUser,
  sendMessageToAdmin,
  getAllMessages,
  deleteMessage,
  editProfile,
};
