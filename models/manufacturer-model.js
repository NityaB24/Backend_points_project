// models/Dealer.js
const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email:String,
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("manufacturer", manufacturerSchema);
