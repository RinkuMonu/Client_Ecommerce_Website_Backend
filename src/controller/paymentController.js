import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

const merchantIdentifier = process.env.ZAAKPAY_MERCHANT_ID;
const secretKey = process.env.ZAAKPAY_SECRET_KEY;
const callbackUrl = process.env.ZAAKPAY_CALLBACK_URL;

if (!merchantIdentifier) {
  console.error("❌ ZAAKPAY_MERCHANT_ID is not defined in .env");
}

if (!secretKey) {
  console.error("❌ ZAAKPAY_SECRET_KEY is not defined in .env");
}

if (!callbackUrl) {
  console.error("❌ ZAAKPAY_CALLBACK_URL is not defined in .env");
}

export const initiatePayment = async (req, res) => {
  try {
    if (!secretKey || !merchantIdentifier || !callbackUrl) {
      return res.status(500).json({
        message: "Payment initiation failed",
        error: "Missing merchantIdentifier, secretKey, or callbackUrl. Check your .env file."
      });
    }

    const orderId = "ORDER_" + Date.now(); // unique orderId
    const txnDate = new Date();
    const formattedTxnDate = txnDate.toISOString().slice(0, 19).replace("T", " ");

    const params = {
      merchantIdentifier,
      orderId,
      returnUrl: callbackUrl,
      buyerEmail: "test@test.com",
      buyerFirstName: "Rinku",
      buyerLastName: "Yadav",
      buyerAddress: "Connaught Place",
      buyerCity: "Delhi",
      buyerState: "Delhi",
      buyerCountry: "India",
      buyerPincode: "110001",
      buyerPhoneNumber: "9876543210",
      txnType: "1",
      zpPayOption: "1",
      mode: "1",
      currency: "INR",
      amount: "20000",
      merchantIpAddress: "::1",
      txnDate: formattedTxnDate,
      purpose: "SALE",
      productDescription: "Test Product",
    };

    // ✅ generate checksum safely
    params.checksum = generateChecksum(params, secretKey);

    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form action="${process.env.ZAAKPAY_ENDPOINT}" method="post">
            ${Object.entries(params)
              .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
              .join("\n")}
          </form>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error in initiatePayment:", err.message);
    res.status(500).json({ message: "Payment initiation failed", error: err.message });
  }
};

export const paymentCallback = async (req, res) => {
  try {
    const data = req.body;
    console.log("🔁 Zaakpay Callback Response:", data);

    const receivedChecksum = data.checksum;
    delete data.checksum;

    const isValid = verifyChecksum(data, receivedChecksum);

    if (!isValid) {
      return res.status(400).json({ status: "failed", message: "Checksum mismatch" });
    }

    res.json({
      status: data.responseCode === "100" ? "success" : "failed",
      orderId: data.orderId,
      responseCode: data.responseCode,
      responseDescription: data.responseDescription,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};