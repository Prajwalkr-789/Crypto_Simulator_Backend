const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  coinName: String,
  transactionType: { type: String, enum: ["buy", "sell"] },
  quantity: { type: Number },
  pricePerCoin: { type: Number },
  totalAmount: { type: Number }, // for buys
  profitOrLoss: { type: Number }, // for sells
  commissionFee: { type: Number },
  purchaseDate: Date,
  sellDate: Date,
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
