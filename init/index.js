const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// 1. Add your database connection string
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "6a96372327d4b39945da7bba",
      // 2. Re-added default geometry to satisfy schema validation
      geometry: {
        type: "Point",
        coordinates: [77.2090, 28.6139], // Default [longitude, latitude]
      },
    }));

    await Listing.insertMany(initData.data);
    console.log("data was initialized");

    // Close connection after successful insertion
    mongoose.connection.close();
  } catch (err) {
    console.log("Error initializing data: ", err);
  }
};

// 3. Connect first, then run initDB once
main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });

// REMOVED: Extra initDB() call at the bottom