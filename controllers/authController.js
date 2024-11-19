const userModel = require("../models/user-model");
const ownerModel = require("../models/owner-model")


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;

    let existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      req.flash("error", "You already have an account, Please login");
      return res.redirect("/");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let newUser = await userModel.create({
      email,
      password: hash,
      fullname,
    });

    let token = generateToken(newUser);
    res.cookie("token", token);

    req.flash("error", "User created successfully");
    return res.redirect("/");

  } catch (err) {
    
    req.flash("error", err.message || "An error occurred during registration");
    return res.redirect("/");
  }
};

module.exports.loginUser = async function(req,res){
  const {email,password} =req.body;
  let user=await userModel.findOne({email});

  if(user){
    bcrypt.compare(password,user.password,async function(err,result){
      if(result){
          user.usertype="user";
          await user.save();
        
          
          let token=generateToken(user);
          
          
          res.cookie("token",token);
          res.redirect("/shop");
          }

      else{
          req.flash("error","wrongs crendential");
          return res.redirect("/")
      }
    })
  }
  else{
    req.flash("error","User not found");
    return res.redirect("/");
  }  
}


module.exports.loginOwner = async function (req, res) {
  const { email, password } = req.body;
  let owner = await ownerModel.findOne({ email });

  if (owner) {
    // Direct comparison of passwords
    if (password === owner.password) {
      owner.usertype = "owner";
      await owner.save();

      let token = generateToken(owner);

      res.cookie("ownerToken", token);
      res.redirect("/owners/allproducts");
    } else {
      req.flash("error","Wrong Credentials" );
      return res.redirect("/admin");
    }
  } else {
    req.flash("error","Owner not found");
    return res.redirect("/");
  }
};


module.exports.logout = function(req,res){
  res.cookie("token","");
  res.redirect("/")
}