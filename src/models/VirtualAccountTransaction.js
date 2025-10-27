import mongoose from "mongoose";

const virtualAccountTransactionSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        transactionNo: String,
        amount: Number,
        name: String,
        mobile: String,
        email: String,
        apiTransactionNo: String,
        status: { type: String, default: "pending" },
        apiPartner: String,
    },
    { timestamps: true }
);

export default mongoose.model("VirtualAccountTransaction", virtualAccountTransactionSchema);
