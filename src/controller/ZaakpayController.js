import crypto from "crypto";
import Order from "../models/Order.model.js";
import dotenv from "dotenv";
dotenv.config();

const merchantIdentifier = process.env.ZAAKPAY_MERCHANT_ID;
const secretKey = process.env.ZAAKPAY_SECRET_KEY;
const endpoint = process.env.ZAAKPAY_ENDPOINT;

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
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      str += params[key];
    }
  });

  return crypto.createHmac("sha256", secretKey).update(str, "utf8").digest("hex");
}

export const initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      orderId,
      email,
      mobile,
      firstName,
      lastName,
      address,
      city,
      state,
      country,
      pincode,
      returnUrl,
    } = req.body;

    const txnDate = new Date().toISOString().replace("T", " ").slice(0, 19);

    const params = {
      merchantIdentifier,
      orderId,
      buyerEmail: email,
      buyerPhoneNumber: mobile,
      buyerFirstName: firstName || "John",
      buyerLastName: lastName || "Doe",
      buyerAddress: address || "Test Address",
      buyerCity: city || "Delhi",
      buyerState: state || "Delhi",
      buyerCountry: country || "IND",
      buyerPincode: pincode || "110001",
      currency: "INR",
      amount: amount * 100, // amount in paisa
      merchantIpAddress: req.ip || "127.0.0.1",
      mode: 0,
      purpose: "SALE",
      productDescription: "Order Payment",
      txnDate,
      zpPayOption: 1,
      returnUrl,
    };

    const checksum = generateChecksum(params);
    params.checksum = checksum;

    // Save order in DB with status "pending"
    await Order.create({
      orderId,
      amount,
      email,
      mobile,
      status: "pending",
      txnDate,
    });

    return res.json({
      success: true,
      endpoint,
      params,
    });
  } catch (error) {
    console.error("Zaakpay Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

export const handleCallback = async (req, res) => {
  try {
    const response = req.body;
    const { checksum, responseCode, orderId } = response;

    // Verify checksum
    const receivedChecksum = checksum;
    delete response.checksum;
    const calculatedChecksum = generateChecksum(response);

    if (receivedChecksum !== calculatedChecksum) {
      console.error("Checksum mismatch for order:", orderId);
      return res.status(400).send("Checksum mismatch");
    }

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).send("Order not found");

    if (responseCode === "100") {
      console.log(`✅ Payment Success for Order ${orderId}`);
      order.status = "paid";
    } else {
      console.log(`❌ Payment Failed for Order ${orderId}`);
      order.status = "failed";
    }

    await order.save();
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Zaakpay Callback Error:", error);
    res.status(500).send("Callback error");
  }
};
