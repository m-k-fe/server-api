const jwt = require("jsonwebtoken");
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (token) {
      jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, user) => {
        if (err) {
          res.status(402);
          throw new Error("Veuillez vous connecter maintenant");
        }
        req.user = user;
        console.log(user);
        next();
      });
    } else {
      res.status(402);
      throw new Error("Veuillez vous connecter maintenant");
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

module.exports = {
  auth,
};
