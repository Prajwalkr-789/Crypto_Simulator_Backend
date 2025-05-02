const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coinName: { type: String, required: true },
  transactionType: { type: String, enum: ["buy", "sell"], required: true },
  quantity: { type: Number, required: true },
  pricePerCoin: { type: Number, required: true },
  totalAmount: Number,
  // profitOrLoss: Number,
  commissionFee: { type: Number, default: 0 },
  purchaseDate: { type: Date },
  sellDate: { type: Date },
}, { timestamps: true });

module.exports = model("Transaction", transactionSchema);
