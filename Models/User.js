const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const holdingSchema = new Schema({
  coinName: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
},{_id : false});

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    walletBalance: { type: Number, default: 100000 },
    holdings: [holdingSchema],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
