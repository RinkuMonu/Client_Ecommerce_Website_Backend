// models/PaymentHistory.model.js

import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    gateway: { type: String, default: "Zaakpay" },
    transactionId: { type: String },
    rawResponse: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentHistory", paymentHistorySchema);
