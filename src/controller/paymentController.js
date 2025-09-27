import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

const merchantIdentifier = "b19e8f103bce406cbd3476431b6b7973";
const secretKey = "0678056d96914a8583fb518caf42828a";

export const initiatePayment = async (req, res) => {
  try {
    const orderId = "ORDER_" + Date.now(); // unique orderId
    const params = {
      merchantIdentifier: "236e6378d80e492f95283a119417ef01",
      orderId,
      returnUrl: "http://localhost:5007/api/payment/callback", // tumhara callback
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
      mode: "0",
      currency: "INR",
      amount: "20000", // INR 200.00
      merchantIpAddress: "::1",
      txnDate: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
      purpose: "0",
      productDescription: "Test Product",
    };

    // ✅ checksum generate karo
    params.checksum = generateChecksum(params, "YOUR_SECRET_KEY");

    // ✅ HTML return karo
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form action="https://zaakstaging.zaakpay.com/transactD?v=8" method="post">
            ${Object.entries(params)
              .map( 
                ([key, value]) =>
                  `<input type="hidden" name="${key}" value="${value}" />`
              )
              .join("\n")}
          </form>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error in initiatePayment:", err.message);
    res.status(500).send("Payment initiation failed");
  }
};


export const paymentCallback = async (req, res) => {
    try {
        const data = req.body;
        console.log("🔁 Zaakpay Callback Response:", data);

        const receivedChecksum = data.checksum;
        delete data.checksum; // verify ke liye hatao

        const isValid = verifyChecksum(data, receivedChecksum);

        if (!isValid) {
            return res.status(400).json({ status: "failed", message: "Checksum mismatch" });
        }

        res.json({
            status: "success",
            message: "Payment verified",
            orderId: data.orderId,
            txnStatus: data.txnStatus || "UNKNOWN",
            data
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};