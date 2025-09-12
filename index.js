require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;
const path = require("path");
const MONGO_URL = process.env.MONGO_URL;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true})); 
app.use(express.json()); 
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret:"my super secret code",
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }

}



// app.get("/",(req,res)=>{
//     res.send("Hi, I am working fine")
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy (User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error"); 
    res.locals.currUser = req.user;
    next();
})

app.use("/map", (req,res) => {
    res.render("layouts/map.html")
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

main()
     .then(()=>{
        console.log("connected to DB");
     })
     .catch((err) => {
        console.log(err);
     })

async function main() {
    await mongoose.connect(MONGO_URL);
}



app.use((req, res, next) => {
    next(new ExpressError(404, "Page not Found !!")) ;
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message="something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message})
    // res.status(statusCode).send(message);
});

app.listen(PORT,() =>{
    console.log(`server is listening on http://localhost:${PORT}/listings`)
});

