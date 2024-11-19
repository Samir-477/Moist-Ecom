const express = require("express")
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model")
const userModel = require("../models/user-model")
const ownerModel = require("../models/owner-model");
const ownerAuthMiddleware = require('../middlewares/ownerAuthMiddleware');





router.get("/", function(req, res) {
  let error = req.flash("error");
  let currentPage = req.path;
  res.render('index', { 
      error: error.length > 0 ? error[0] : "", 
      message: req.query.message || "", loggedin: false,currentPage:"Moist"
     
  });
});

router.get("/shop",isloggedin,async function(req,res){
  let products = await productModel.find();
  let success = req.flash("success")
  res.render("shop",{products,success,currentPage:"Shop"});
})


router.get("/cart", isloggedin, async function(req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");

  // Calculate the bill for each item in the cart
  const cartWithBill = user.cart.map(item => {
    const itemBill = Number(item.price) + 20 - Number(item.discount);
    return { ...item.toObject(), itemBill };  // Spread the item object and add itemBill
  });

  res.render("cart", { user, cartWithBill,currentPage: 'Cart'});
});

router.get("/addtocart/:productid", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });

  // Add the product to the cart
  user.cart.push(req.params.productid);
  await user.save();
  
  req.flash("success", "Added to Cart");
  res.redirect("/shop"); // Redirect to the shop page
});


router.get("/cart/decrement/:productid", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });

  // Find the product and remove one instance of it from the cart
  const productIndex = user.cart.indexOf(req.params.productid);
  if (productIndex > -1) {
    user.cart.splice(productIndex, 1);
  }

  await user.save();
  
  res.redirect("/cart"); // Redirect to the cart page
});


router.get("/cart/increment/:productid", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });

  // Add the product to the cart (incrementing quantity)
  user.cart.push(req.params.productid);
  await user.save();
  
  req.flash("success", "Quantity Updated");
  res.redirect("/cart"); // Redirect to the cart page
});



router.get("/admin",function(req,res){
  res.render("owner-login",{loggedin: false,currentPage: "Admin"});
})



router.get("/profile", isloggedin, async (req, res) => {
  try {
    // Assuming req.user contains the authenticated user's ID
    const user = await userModel.findById(req.user._id).populate("cart");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    res.render("profile", { user,currentPage: 'Profile' });
  } catch (error) {
    console.error(error);
    req.flash("error", "An error occurred while loading the profile.");
    res.redirect("/");
  }
})


module.exports = router;
