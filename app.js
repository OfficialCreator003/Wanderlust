if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
 
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models & Utilities
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("./middlewere.js");
const reviewControllers = require("./controllers/reviews.js");

// Routes
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

const DB = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(DB);
}

// App Configurations & Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Mongo Session Store
const store = MongoStore.create({
  mongoUrl: DB,
  crypto: {
    secret: process.env.SECRET ,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Middleware: Session & Flash
app.use(session(sessionOptions));
app.use(flash());

// Middleware: Passport Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local Variables Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Root Route: Render Hero Landing Page
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Express Routers
app.use("/listings", listingRouter);
app.use("/", userRouter);

// Review Routes
app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewControllers.createReview)
);

app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewControllers.destroyReview)
);

// Best & Safest Catch-All (Works on both Express 4 and Express 5) [solved]
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listing/error.ejs", { message });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

//Hello-Developer