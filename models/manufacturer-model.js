// models/Dealer.js
const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email:String,
  phone:String,
  balance: { type: Number, default: 0 },
  retailerScheme: {type:String},
  userScheme:{type:String},
  role: { type: String, default: 'manufacturer' }
});

module.exports = mongoose.model("manufacturer", manufacturerSchema);
