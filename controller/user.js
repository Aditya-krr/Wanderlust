const User = require("../models/user")

//signup form

const { model } = require("mongoose");

module.exports.signupForm = (req, res) => {
res.render("users/signup.ejs")
};


//signup route
module.exports.signup = async (req, res) => {
try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
    if (err) {
        return next(err);
        }
         req.flash("success", "Welcome to Wanderlust!")
         res.redirect("/listings");
       });
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
        }

    };

//login Form 

module.exports.loginForm = (req, res) => {
res.render("users/login.ejs");
};

//login Route 
module.exports.loginRoute =  async (req, res) => {
    req.flash("success","Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};


//logout Route 
module.exports.logoutRoute = async (req, res, next) => {
     req.logout((err) => {
    if (err) {
    return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
    });
};