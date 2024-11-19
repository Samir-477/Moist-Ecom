const express = require("express");
const router = express.Router();


const { registerUser, loginUser,logout } = require("../controllers/authController");

// Registration route
router.post("/register", registerUser);

router.post("/login",loginUser);

router.get("/logout",logout);



module.exports = router;
