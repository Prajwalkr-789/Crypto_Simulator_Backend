const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const holdingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  coinName: { type: String },
  quantity: { type: Number },
  purchasePrice: { type: Number }, // average price per coin
  purchaseDate: {type: Date}
}, { timestamps: true });

const Holding = mongoose.model("Holding", holdingSchema);

module.exports = Holding;
