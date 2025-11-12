import crypto from "crypto";
import qs from "qs"; // you can also use querystring if preferred

// ✅ LIVE ENVIRONMENT CONFIG
const merchantId = "236e6378d80e492f95283a119417ef01";
const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
const apiUrl = "https://api.zaakpay.com/api/paymentTransact/V8";

// ✅ Generate Zaakpay Checksum
const generateZaakpayChecksum = (data, key) => {
  const sortedKeys = Object.keys(data)
    .filter(k => data[k] !== null && data[k] !== undefined && data[k] !== "")
    .sort();

  const plainText = sortedKeys.map(k => `${k}=${data[k]}`).join("&") + "&";
  console.log("✅ String used for checksum:", plainText);

  const checksum = crypto
    .createHmac("sha256", key)
    .update(plainText)
    .digest("hex");

  console.log("✅ Generated Checksum:", checksum);
  return checksum;
};

// ✅ Step 1: Generate Zaakpay PayIn URL
export const zaakpayPayin = async (req, res) => {
  try {
    const { amount, email } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        message: "Amount and email are required",
      });
    }

    const orderId = `ZAAK${Date.now()}`;
    const params = {
      amount: (amount * 100).toString(), // amount in paise
      buyerEmail: email,
      currency: "INR",
      merchantIdentifier: merchantId,
      orderId,
      productDescription: "Test Transaction",
      returnUrl: "https://jajamblockprints.com/api/callback",
    };

    // Generate checksum
    const checksum = generateZaakpayChecksum(params, secretKey);

    // ✅ Combine into final form body
    const requestBody = qs.stringify({ ...params, checksum });

    return res.json({
      success: true,
      message: "Zaakpay payment URL generated successfully",
      paymentUrl: apiUrl,
      requestBody,
      orderId,
    });
  } catch (error) {
    console.error("Zaakpay Error:", error);
    return res.status(500).json({
      success: false,
      message: "Zaakpay integration failed",
      error: error.message,
    });
  }
};

// ✅ Step 2: Handle Zaakpay Callback
export const zaakpayCallback = async (req, res) => {
  try {
    const response = req.body;
    console.log("✅ Zaakpay Callback Response:", response);

    const receivedChecksum = response.checksum;
    delete response.checksum;

    const calculatedChecksum = generateZaakpayChecksum(response, secretKey);

    if (receivedChecksum === calculatedChecksum) {
      console.log("✅ Checksum verified successfully");

      if (response.responseCode === "100") {
        console.log("🎉 Payment Successful for Order:", response.orderId);
        return res.send(`<h3>Payment Successful for Order: ${response.orderId}</h3>`);
      } else {
        console.log("❌ Payment Failed for Order:", response.orderId);
        return res.send(`<h3>Payment Failed for Order: ${response.orderId}</h3>`);
      }
    } else {
      console.log("❌ Invalid checksum received in callback");
      return res.status(400).send("Invalid checksum received.");
    }
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).send("Internal Server Error in Callback");
  }
};
