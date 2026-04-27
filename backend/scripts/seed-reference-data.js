// const mongoose = require("mongoose");

// const config = require("../config/env");
// const Category = require("../models/Category");
// const Country = require("../models/Country");

// const categories = [
//   { id: "Hindu", title: "Hindu Names", icon: "om", color: "#FFE6D9", order: 1 },
//   { id: "Muslim", title: "Muslim Names", icon: "star-and-crescent", color: "#EAF8E7", order: 2 },
//   { id: "Jain", title: "Jain Names", icon: "leaf", color: "#E9FCEB", order: 3 },
//   { id: "Buddhist", title: "Buddhist Names", icon: "sun", color: "#FFF4D6", order: 4 },
//   { id: "Modern", title: "Modern Names", icon: "rocket", color: "#E6F1FF", order: 5 },
//   { id: "Trending", title: "Trending Names", icon: "chart-line", color: "#FFF2CC", order: 6 },
//   { id: "Persian", title: "Persian Names", icon: "gem", color: "#F3E8FF", order: 7 },
//   { id: "Arabic", title: "Arabic Names", icon: "moon", color: "#E8F9FF", order: 8 },
//   { id: "Royal", title: "Royal Names", icon: "crown", color: "#FFE7D9", order: 9 },
// ];

// const countries = [
//   { code: "India", label: "India", flag: "🇮🇳", order: 1 },
//   { code: "USA", label: "USA", flag: "🇺🇸", order: 2 },
//   { code: "UK", label: "UK", flag: "🇬🇧", order: 3 },
//   { code: "UAE", label: "UAE", flag: "🇦🇪", order: 4 },
//   { code: "Canada", label: "Canada", flag: "🇨🇦", order: 5 },
// ];

// async function upsertByUnique(Model, uniqueKey, docs) {
//   await Promise.all(
//     docs.map((doc) =>
//       Model.findOneAndUpdate(
//         { [uniqueKey]: doc[uniqueKey] },
//         { $set: doc },
//         { upsert: true, new: true, setDefaultsOnInsert: true },
//       ),
//     ),
//   );
// }

// async function run() {
//   await mongoose.connect(config.mongodbUri);

//   await upsertByUnique(Category, "id", categories);
//   await upsertByUnique(Country, "code", countries);

//   console.log("Reference data seeded successfully.");
//   await mongoose.disconnect();
// }

// run().catch(async (error) => {
//   console.error("Failed to seed reference data:", error.message);
//   try {
//     await mongoose.disconnect();
//   } catch {
//     // Ignore disconnect failure.
//   }
//   process.exit(1);
// });
