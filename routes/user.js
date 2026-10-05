const express=require("express");
const router=express.Router();
const User= require("../models/user.js");
const wrapAsync=require("../utils/WrapAsync.js");
const passport=require("passport");
const { saveRedirectUrl }=require("../middlewere.js");
const userControllers= require("../controllers/user.js");



router.route("/signup")

.get( userControllers.renderSignupFrom)

.post( wrapAsync(userControllers.signup))


router.route("/login")


.get(userControllers.renderLoginForm)

.post(saveRedirectUrl,
    passport.authenticate("local",
        { failureRedirect: "/login", failureFlash: true}), userControllers.Login );



router.get("/logout",userControllers.Logout);

module.exports=router;