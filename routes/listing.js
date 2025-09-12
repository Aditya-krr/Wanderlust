const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controller/listing.js")
const multer  = require('multer')
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage })


//router-route

router
  .route("/listings")
  .get( wrapAsync (listingController.index ))
  .post( isLoggedIn, 
     upload.single("listing[image]"),
     validateListing,
      wrapAsync(listingController.createRoute)
    );

// New Routes
router.get("/new",isLoggedIn, (listingController.newRoute) );

router
    .route("/:id")
    .get( wrapAsync(listingController.showRoute))
    
    .put( isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateRoute))
    .delete( isLoggedIn,isOwner, wrapAsync( listingController.deleteRoute));


//Edit Route

router.get("/:id/edit", isLoggedIn,isOwner,  wrapAsync(listingController.editRoute));



module.exports = router;

