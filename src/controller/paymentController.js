import { config } from "../../config.js";
import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

export const initiatePayment = async (req, res) => {
  try {
    const { merchantId, secretKey, callbackUrl, endpoint } = config;

    console.log("🔍 initiatePayment ENV:", { merchantId, secretKey, callbackUrl, endpoint });

    if (!secretKey || !merchantId || !callbackUrl) {
      return res.status(500).json({
        message: "Payment initiation failed",
        error: "Missing merchantId, secretKey, or callbackUrl. Check your .env file."
      });
    }

    const orderId = "ORDER_" + Date.now();
    const txnDate = new Date();
    const formattedTxnDate = txnDate.toISOString().slice(0, 19).replace("T", " ");

    const params = {
      merchantIdentifier: merchantId,
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

    params.checksum = generateChecksum(params, secretKey);

    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form action="${endpoint}" method="post">
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
    const { secretKey } = config;   // ✅ yahan destructure

    const data = req.body;
    console.log("🔁 Zaakpay Callback Response:", data);

    const receivedChecksum = data.checksum;
    delete data.checksum;

    const isValid = verifyChecksum(data, receivedChecksum, secretKey);

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
    console.error("❌ Error in paymentCallback:", err.message);
    res.status(500).json({ error: err.message });
  }
};