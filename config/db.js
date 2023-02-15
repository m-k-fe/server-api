const mongoose = require("mongoose");
const url = process.env.DB_URL;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo DB Connection Successfull"))
  .catch((err) => console.log("Mongo DB Connection Failed", err));
