const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const app = express();
//Middlewares
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
//Routes
const authRouter = require("./routes/authRouter");
const productRouter = require("./routes/productRouter");
const userRouter = require("./routes/userRouter");
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
if (process.env.NODE_ENV === "production") {
  app.use("/", express.static("public"));
  app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
} else {
  app.get("/", (req, res) => res.send("Api Running"));
}
//Server
const port = process.env.PORT;
app.listen(port, console.log(`Server Running On Port ${port}`));
