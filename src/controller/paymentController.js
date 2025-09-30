import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

export const initiatePayment = async (req, res) => {
  try {
    // Static test values (replace with req.body later)
    const merchantId = process.env.ZAAKPAY_MERCHANT_ID;
    const secretKey = process.env.ZAAKPAY_SECRET_KEY;
    const callbackUrl = process.env.ZAAKPAY_CALLBACK_URL;
    const endpoint = process.env.ZAAKPAY_ENDPOINT;

    const orderId = "ORDER_" + Date.now();

    // Zaakpay expects full timestamp: YYYY-MM-DD HH:mm:ss
    const txnDate = new Date().toISOString().replace("T", " ").split(".")[0];

    // Build payload exactly as per docs
    const payload = {
      merchantIdentifier: merchantId,
      showMobile: "true",
      mode: "0",
      returnUrl: callbackUrl,
      orderDetail: {
        orderId,
        amount: "20000", // ₹200 in paisa (static)
        currency: "INR",
        productDescription: "Static Test Product",
        email: "test@demo.com",
        txnDate,
      },
      paymentInstrument: {
        paymentMode: "netbanking", // static test
        netbanking: { bankid: "HDF" }, // HDFC Bank code
      },
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(payload);

    // Generate checksum
    const checksum = generateChecksum(jsonString, secretKey);

    // Auto-submit form to Zaakpay
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form action="${endpoint}" method="post">
            <input type="hidden" name="data" value='${jsonString}' />
            <input type="hidden" name="checksum" value="${checksum}" />
          </form>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error in initiatePayment:", err);
    res.status(500).json({ error: err.message });
  }
};

export const paymentCallback = async (req, res) => {
  try {
    const secretKey = process.env.ZAAKPAY_SECRET_KEY;

    // Zaakpay sends: data=<json_string>&checksum=<checksum>
    const { data, checksum } = req.body;

    if (!data || !checksum) {
      return res.status(400).json({ status: "failed", message: "Missing data or checksum" });
    }

    // Verify checksum on raw JSON string
    const isValid = verifyChecksum(data, checksum, secretKey);

    if (!isValid) {
      return res.status(400).json({ status: "failed", message: "Checksum mismatch" });
    }

    // Parse the JSON payload
    const parsedData = JSON.parse(data);
    console.log("🔁 Callback Data:", parsedData);

    // Respond with status
    res.json({
      status: parsedData.responseCode === "100" ? "success" : "failed",
      orderId: parsedData.orderId,
      responseCode: parsedData.responseCode,
      responseDescription: parsedData.responseDescription,
      data: parsedData,
    });
  } catch (err) {
    console.error("❌ Error in paymentCallback:", err);
    res.status(500).json({ error: err.message });
  }
};
