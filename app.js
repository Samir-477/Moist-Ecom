const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");
const flash = require("connect-flash");

const indexRouter = require("./routes/index");
const ownersRouter = require("./routes/ownersRouter"); // Corrected variable name
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");



require("dotenv").config();
const db = require("./config/mongoose-connection");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET,
}));

app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Define routes
app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});