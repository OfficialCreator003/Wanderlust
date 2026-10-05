const express = require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/expressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing } = require("../middlewere.js");
const listingController= require("../controllers/listing.js");
const multer = require("multer");
const {storage}=require("../cloudeConfig.js");
const upload=multer({storage});



router
.route("/")

//Index Route
.get(wrapAsync(listingController.index))

//create Route
.post(isLoggedIn,
 
    //
    upload.single("listing[image]"),validateListing, 
    wrapAsync(listingController.createListing)
)

                                                                                                                             



//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm)


router
.route("/:id")

//Show Route
.get( wrapAsync(listingController.shoeListing))

//Update Route
.put(isLoggedIn,isOwner,
    
    upload.single("listing[image]"),validateListing,
   
    wrapAsync(listingController.updateListing))

//Delete Route
    .delete(isLoggedIn,isOwner,
    wrapAsync(listingController.destroyListing));


    










//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(listingController.renderEditForm));




module.exports=router;
