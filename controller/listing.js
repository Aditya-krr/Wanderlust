const Listing = require("../models/listing.js");
const { geocoding, config } = require("@maptiler/client");   // Import MapTiler SDK
const mapToken = process.env.MAP_TOKEN ; 
config.apiKey = process.env.MAP_TOKEN;  // API key from .env

// index Route

module.exports.index = async (req, res) => {
  const { category, search } = req.query;

  let filter = {};

  // Category filter
  if (category) {
    filter.category = new RegExp(`^${category}$`, "i");
  }

  // Search filter (title or location)
  if (search) {
    filter.$or = [
      { title: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { country: new RegExp(search, "i") }
    ];
  }

  const allListings = await Listing.find(filter);

  res.render("listings/index", { allListings, selectedCategory: category, search });
  
};


// new route 
module.exports.newRoute = (req, res) => {
  res.render("listings/new.ejs");
};

// create route 
module.exports.createRoute = async (req, res, next) => {
  try {
    // Call MapTiler Geocoding API
    const response = await geocoding.forward(req.body.listing.location, {
      key: mapToken,
      limit: 1
    });

    if (!response.features || response.features.length === 0) {
      req.flash("error", "Location not found, please try again");
      return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.features[0].geometry; // Save lat/lng

    await newListing.save();
    console.log(newListing);

    req.flash("success", "New Listing Created Successfully");
    res.redirect("/listings");
  } catch (err) {
    console.error("Geocoding error:", err);
    req.flash("error", "Something went wrong while creating the listing");
    res.redirect("/listings/new");
  }
};

// edit route 
module.exports.editRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// update route 
module.exports.updateRoute = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated Successfully");
  res.redirect(`/listings/${id}`);
};

// delete route 
module.exports.deleteRoute = async (req, res) => {
  let { id } = req.params;
  let deletedList = await Listing.findByIdAndDelete(id);
  console.log(deletedList);
  req.flash("success", "Listing Deleted Successfully");
  res.redirect("/listings");
};

// show route 
module.exports.showRoute = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "review",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested doesn't exist");
    return res.redirect("/listings");
  }

  console.log(listing);
  res.render("listings/show.ejs", { listing });
};
