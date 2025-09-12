const express = require("express");
const router = express. Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport")
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controller/user.js");


//signup Route
router
  .route("/signup")
  .get( (userController.signupForm))
  .post(wrapAsync(userController.signup));

//Login Route
router
   .route("/login", )
   .get((userController.loginForm))
   .post(
    saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
    }),
    (userController.loginRoute));

//Logout Route
router.get("/logout", (userController.logoutRoute));

module.exports = router;