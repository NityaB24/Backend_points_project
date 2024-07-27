const mongoose = require ('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  points: Number,
  type: { type: String, enum: ['received', 'redeemed'] },
  date: { type: Date, default: Date.now },
  expiryDate: Date
});


const userSchema = mongoose.Schema({
  name: { type: String, minLength: 3, trim: true },
  email: String,
  password: String,
  points: { type: Number, default: 0 },
  pointsReceived: { type: Number, default: 0 },
  pointsRedeemed: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  pointsHistory: [pointsHistorySchema],
  allEntries: [pointsHistorySchema],
  couponCodes: [String] ,
  role: { type: String, default: 'user' },
  kyc:{ type: mongoose.Schema.Types.ObjectId, ref: 'userKYC' },
  status:{type:String,default:'pending'},
  profilePhoto:{type:String},
  phone:{type:String},
});

  module.exports = mongoose.model('user', userSchema);