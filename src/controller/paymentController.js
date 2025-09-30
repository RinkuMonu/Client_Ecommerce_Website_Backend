import axios from "axios";
import qs from "qs";
import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

export const initiatePayment = async (req, res) => {
  try {
    const merchantId = process.env.ZAAKPAY_MERCHANT_ID;
    const secretKey = process.env.ZAAKPAY_SECRET_KEY;
    const callbackUrl = process.env.ZAAKPAY_CALLBACK_URL;
    const endpoint = process.env.ZAAKPAY_ENDPOINT;

    const orderId = "ORDER_" + Date.now();

    // Zaakpay requires full timestamp: YYYY-MM-DD HH:mm:ss
    const txnDate = new Date().toISOString().replace("T", " ").split(".")[0];

    // 🔹 Build payload as per docs
    const payload = {
      merchantIdentifier: merchantId,
      merchantIpAddress: "127.0.0.1", // later replace with req.ip
      showMobile: "true",
      mode: "0",
      returnUrl: callbackUrl,
      orderDetail: {
        orderId,
        amount: "2000", // in paisa (₹20)
        currency: "INR",
        purpose: "1",
        productDescription: "UPI P2M Collect",
        email: "testuser@example.com",
        txnDate,
      },
      billingAddress: {
        firstName: "Test_FirstName",
        lastName: "Test_LastName",
        address: "Sector 56",
        city: "Gurugram",
        state: "Haryana",
        country: "India",
        pincode: "122003",
        phoneNumber: "9999999999",
      },
      shippingAddress: {
        address: "Sector 54",
        city: "Gurugram",
        state: "Haryana",
        country: "India",
        pincode: "122003",
      },
      paymentInstrument: {
        paymentMode: "UPI",
        upi: {
          vpa: "testvpa@upi", // test VPA
        },
      },
      debitorcredit: "upi",
    };

    // 🔹 Convert payload to JSON string
    const jsonString = JSON.stringify(payload);

    // 🔹 Generate checksum
    const checksum = generateChecksum(jsonString, secretKey);

    // 🔹 Send request to Zaakpay TransactU
    const response = await axios.post(
      endpoint,
      qs.stringify({ data: jsonString, checksum }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // 🔹 Return Zaakpay response to frontend
    res.json({
      message: "Payment initiation request sent",
      orderId,
      response: response.data,
    });
  } catch (err) {
    console.error("❌ Error in initiatePayment:", err.response?.data || err.message);
    res.status(500).json({ error: err.message, details: err.response?.data });
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
