import crypto from "crypto";
import Order from "../models/Order.model.js";
import dotenv from "dotenv";
dotenv.config();

const merchantIdentifier = process.env.ZAAKPAY_MERCHANT_ID;
const secretKey = process.env.ZAAKPAY_SECRET_KEY;
const endpoint = process.env.ZAAKPAY_ENDPOINT;
const callbackUrl = process.env.ZAAKPAY_CALLBACK_URL;

// 🔑 Generate checksum
function generateChecksum(params) {
  let str = "";
  const orderedKeys = [
    "merchantIdentifier",
    "orderId",
    "buyerEmail",
    "buyerPhoneNumber",
    "buyerFirstName",
    "buyerLastName",
    "buyerAddress",
    "buyerCity",
    "buyerState",
    "buyerCountry",
    "buyerPincode",
    "currency",
    "amount",
    "merchantIpAddress",
    "mode",
    "purpose",
    "productDescription",
    "txnDate",
    "zpPayOption",
    "returnUrl",
  ];

  orderedKeys.forEach((key) => {
    if (params[key]) str += params[key];
  });

  return crypto.createHmac("sha256", secretKey).update(str, "utf8").digest("hex");
}

// 🔹 Step 1: Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const params = {
      merchantIdentifier,
      orderId: orderId.toString(),
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: "INR",
      returnUrl: callbackUrl,
      mode: "0", // 0 = LIVE, 1 = TEST
      purpose: "Order Payment",
      productDescription: "Ecommerce Order Payment",
      txnDate: new Date().toISOString(),
      buyerEmail: req.user?.email || "test@example.com",
      buyerPhoneNumber: req.user?.mobile || "9999999999",
      buyerFirstName: req.user?.firstName || "John",
      buyerLastName: req.user?.lastName || "Doe",
    };

    const checksum = generateChecksum(params);

    res.json({
      success: true,
      paymentUrl: endpoint,
      params: { ...params, checksum },
    });
  } catch (err) {
    console.error("Zaakpay Payment Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔹 Step 2: Callback from ZaakPay
export const paymentCallback = async (req, res) => {
  try {
    const response = req.body;
    const { orderId, responseCode, responseMsg, checksum } = response;

    // ✅ Verify checksum
    const { checksum: _, ...dataToVerify } = response;
    const calculatedChecksum = generateChecksum(dataToVerify);

    if (checksum !== calculatedChecksum) {
      return res.status(400).json({ success: false, message: "Checksum mismatch" });
    }

    // ✅ Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: responseCode === "100" ? "completed" : "failed",
      paymentResponse: response,
    });

    res.json({
      success: responseCode === "100",
      orderId,
      message: responseMsg,
      response,
    });
  } catch (err) {
    console.error("Zaakpay Callback Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};