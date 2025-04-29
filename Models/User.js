const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const holdingSchema = new Schema({
  coinName: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
});

const transactionSchema = new Schema({
  coinName: { type: String, required: true },
  transactionType: { type: String, enum: ["buy", "sell"], required: true },
  quantity: { type: Number, required: true },
  pricePerCoin: { type: Number, required: true },
  totalAmount: Number, // For buy
  profitOrLoss: Number, // For sell
  commissionFee: { type: Number, default: 0 },
  purchaseDate: { type: Date },
  sellDate: { type: Date },
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    walletBalance: { type: Number, default: 100000 },
    holdings: [holdingSchema],
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
