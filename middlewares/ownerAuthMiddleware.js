const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
  if (!req.cookies.ownerToken) {
    req.flash("error", "You need to login first as an owner");
    return res.redirect("/admin");
  }

  try {
    let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
    let owner = await ownerModel.findOne({ email: decoded.email }).select("-password");

    

    req.owner = owner;
    next();
  } catch (err) {
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
};