const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("email-validator");
const User = require("../models/userModel");
const {
  createActivateToken,
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokens");
const { sendMail } = require("./sendMail");

//Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password, confPassword } = req.body;
    if (!username || !email || !password || !confPassword) {
      res.status(401);
      throw new Error("Veuillez remplir tous les champs");
    }
    if (username.length < 6 || username.length > 20) {
      res.status(403);
      throw new Error(
        "Le nom d'utilisateur doit etre compris entre 6 et 20 caractères"
      );
    }
    if (!validator.validate(email)) {
      res.status(404);
      throw new Error("Cet email n'est pas valide");
    }
    if (password.length < 6 || password.length > 20) {
      throw new Error(
        "Le mot de passe doit etre compris entre 6 et 20 caractères"
      );
    }
    if (password !== confPassword) {
      res.status(402);
      throw new Error("Les mots de passe doivent etre les memes");
    }
    const isExistUser = await User.findOne({ email });
    if (isExistUser) {
      res.status(401);
      throw new Error("Cet email est déja utilisé");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      username,
      email,
      password: hashedPassword,
    };
    const activateToken = createActivateToken(newUser);
    const url = `${process.env.CLIENT_URL}/auth/active/${activateToken}`;
    sendMail(email, url, "Activer votre email", "Activer votre email");
    res.status(202).json({
      message:
        "Inscription réussie ! Veuillez activer votre email pour commencer",
    });
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Active Email
const activeEmail = async (req, res) => {
  try {
    const { activateToken } = req.body;
    const user = jwt.verify(activateToken, process.env.ACTIVATE_SECRET_KEY);
    const isExistUser = await User.findOne({ email: user.email });
    if (isExistUser) {
      res.status(404);
      throw new Error("Cet email est déja utilisée");
    }
    await new User({
      username: user.username,
      email: user.email,
      password: user.password,
    }).save();
    res.status(203).json({ message: "Le compte a été activé !!" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

//Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(401);
      throw new Error("Veuillez remplir tous les champs");
    }
    const isExistUser = await User.findOne({ email });
    if (!isExistUser) {
      res.status(402);
      throw new Error("Cet utilisateur n'existe pas");
    }
    if (await bcrypt.compare(password, isExistUser.password)) {
      const refreshToken = createRefreshToken({ _id: isExistUser._id });
      res.cookie("refreshtoken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true,
      });
      res.status(203).json({ message: "Connexion réussie" });
    } else {
      res.status(403);
      throw new Error("Le mot de passe est incorrect");
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Get Access Token
const getAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshtoken;
    if (!token) {
      res.status(402);
      throw new Error("Veuillez vous connecter maintenant");
    }
    jwt.verify(token, process.env.REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        res.status(402);
        throw new Error("Veuillez vous connecter maintenant");
      }
      const accessToken = createAccessToken({ _id: user._id });
      res.status(202).json({ accessToken });
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

//Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Veuillez entrer votre email");
    }
    const isExistUser = await User.findOne({ email });
    if (!isExistUser) {
      res.status(401);
      throw new Error("Cet email n'existe pas");
    }
    const accessToken = createAccessToken({ _id: isExistUser._id });
    const url = `${process.env.CLIENT_URL}/auth/reset/${accessToken}`;
    sendMail(
      email,
      url,
      "Réinitialisez votre mot de passe",
      "Réinitialisez votre mot de passe"
    );
    res.status(201).json({
      message: "Renvoyez le mot de passe, veuillez vérifier votre e-mail.",
    });
  } catch (err) {
    res.status(402).json({ message: err.message });
  }
};

//Reset Password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(401);
      throw new Error("Veuillez entrez un mot de passe");
    }
    if (password.length < 6 || password.length > 20) {
      res.status(402);
      throw new Error(
        "Le mot de passe doit etre compris entre 6 et 20 caractères"
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(
      req.user._id,
      { password: hashedPassword },
      { new: true }
    );
    res.status(202).json({ message: "Mot de passe changé avec succès!!" });
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Logout User
const logOutUser = async (req, res) => {
  try {
    res.cookie("refreshtoken", "", { maxAge: 1 });
    res.status(202).json({ message: "Utilisateur déconnécté" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

//Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(404);
      throw new Error("Please, add all fields");
    }
    const isExistAdmin = await User.findOne({ email });
    if (!isExistAdmin) {
      res.status(404);
      throw new Error("User dosen't exist");
    }
    if (isExistAdmin.role !== "admin") {
      res.status(404);
      throw new Error("Not Authorized");
    }
    if (await bcrypt.compare(password, isExistAdmin.password)) {
      const refreshToken = createRefreshToken({ _id: isExistAdmin._id });
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 3600 * 1000,
      });
      res.status(203).json({ message: "Login success" });
    } else {
      res.status(404);
      throw new Error("Invalid password");
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Forgot Password Admin
const forgotPasswordAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Veuillez entrer votre email");
    }
    const isExistAdmin = await User.findOne({ email });
    if (!isExistAdmin) {
      res.status(401);
      throw new Error("Cet email n'existe pas");
    }
    if (isExistAdmin.role !== "admin") {
      res.status(404);
      throw new Error("Not Authorized");
    }
    const accessToken = createAccessToken({ _id: isExistAdmin._id });
    const url = `${process.env.CLIENT_URL}/auth/reset/${accessToken}`;
    sendMail(
      email,
      url,
      "Réinitialisez votre mot de passe",
      "Réinitialisez votre mot de passe"
    );
    res.status(201).json({
      message: "Renvoyez le mot de passe, veuillez vérifier votre e-mail.",
    });
  } catch (err) {
    res.status(402).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  activeEmail,
  loginUser,
  getAccessToken,
  forgotPassword,
  resetPassword,
  logOutUser,
  loginAdmin,
  forgotPasswordAdmin,
};
