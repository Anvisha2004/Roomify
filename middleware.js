const Listing=require("./models/listing");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async (req, res, next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }

};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }

};

module.exports.isReviewAuthor= async (req, res, next)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// module.exports.isReviewAuthor = async (req, res, next) => {
//     try {
//         let { id, reviewId } = req.params;
//         let review = await Review.findById(reviewId);

//         if (!review) {
//             req.flash("error", "Review not found");
//             return res.redirect(`/listings/${id}`);
//         }

//         if (!review.author || !review.author._id.equals(res.locals.currUser._id)) {
//             req.flash("error", "You don't have permission");
//             return res.redirect(`/listings/${id}`);
//         }

//         next();
//     } catch (error) {
//         console.error("Error in isReviewAuthor middleware:", error);
//         req.flash("error", "Something went wrong");
//         return res.redirect(`/listings/${id}`);
//     }
// };
