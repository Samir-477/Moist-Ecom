const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const productModel = require('../models/product-model');

const ownerAuthMiddleware = require('../middlewares/ownerAuthMiddleware'); // Import the owner authentication middleware
const { loginOwner, logout } = require("../controllers/authController");

// Middleware to parse incoming request bodies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/login",loginOwner);




// Apply owner authentication middleware to all routes below this line


// Route for creating an owner (only allowed in development environment)
if (process.env.NODE_ENV === "development") {
    router.post("/create", async function (req, res) {
        try {
            const existingOwners = await ownerModel.find();
            if (existingOwners.length > 0) {
                return res.status(503).send("You don't have permissions to create a new owner");
            }

            const { fullname, email, password } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const newOwner = await ownerModel.create({
                fullname,
                email,
                password: hashedPassword,
            });

            res.status(201).send(newOwner);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });
}

// Route to display the create products page
router.get("/createproducts",ownerAuthMiddleware ,function(req, res) {
    let success = req.flash("success");
    res.render("createproducts", { success, currentPage: 'Products' });
});

router.get("/allproducts",ownerAuthMiddleware ,async function (req, res) {
    try {
        let products = await productModel.find();
        let success = req.flash("success");
        res.render("admin", { products, success, currentPage: 'Products' });
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to load products.");
        res.redirect("/admin");
    }
});

// Route to delete a specific product
router.get("/deleteproduct/:productid",ownerAuthMiddleware ,async function (req, res) {
    try {
        await productModel.findByIdAndDelete(req.params.productid);
        req.flash("success", "Product deleted successfully.");
        res.redirect("/owners/allproducts");
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to delete product.");
        res.redirect("/admin");
    }
});

// Route to delete all products
router.get("/deleteall",ownerAuthMiddleware ,async function (req, res) {
    try {
        await productModel.deleteMany({});
        req.flash("success", "All products deleted successfully.");
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to delete all products.");
        res.redirect("/admin");
    }
});


router.get("/logout",logout);

module.exports = router;