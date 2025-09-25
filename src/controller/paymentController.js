// import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

// const merchantIdentifier = "236e6378d80e492f95283a119417ef01"; // replace with yours
// const secretKey = "8bc8c997888f42cea0e2e82b958de393"; // replace with yours

// // 🔹 Initiate Payment
// export const initiatePayment = async (req, res) => {
//   try {
//     const params = {
//       merchantIdentifier: "LIVE_MERCHANT_IDENTIFIER",
//       orderId,
//       returnUrl: "https://api.jajamblockprints.com/api/payment/callback",
//       buyerEmail: "test@test.com",
//       buyerFirstName: "Rinku",
//       buyerLastName: "Yadav",
//       buyerAddress: "Connaught Place",
//       buyerCity: "Delhi",
//       buyerState: "Delhi",
//       buyerCountry: "India",
//       buyerPincode: "110001",
//       buyerPhoneNumber: "9876543210",
//       txnType: "1",
//       zpPayOption: "1", // All methods
//       mode: "0",
//       currency: "INR",
//       amount: "20000", // 200.00 INR
//       merchantIpAddress: req.ip || "127.0.0.1",
//       txnDate: new Date().toISOString().slice(0, 10),
//       purpose: "0",
//       productDescription: "Test Product",
//     };

//     // ✅ checksum generate karo
//     params.checksum = generateChecksum(params, "YOUR_SECRET_KEY");

//     // ✅ HTML return karo
//     res.send(`
//       <html>
//         <body onload="document.forms[0].submit()">
//           <form action="https://api.zaakpay.com/transactD?v=8" method="post">
//             ${Object.entries(params)
//         .map(
//           ([key, value]) =>
//             `<input type="hidden" name="${key}" value="${value}" />`
//         )
//         .join("\n")}
//           </form>
//         </body>
//       </html>
//     `);
//   } catch (err) {
//     console.error("❌ Error in initiatePayment:", err.message);
//     res.status(500).send("Payment initiation failed");
//   }
// };

// // 🔹 Callback

// export const paymentCallback = async (req, res) => {
//   try {
//     const data = req.body;
//     console.log("🔁 Zaakpay Callback Response:", data);

//     const receivedChecksum = data.checksum;
//     delete data.checksum; // verify ke liye hatao

//     const isValid = verifyChecksum(data, receivedChecksum);

//     if (!isValid) {
//       return res.status(400).json({ status: "failed", message: "Checksum mismatch" });
//     }

//     res.json({
//       status: "success",
//       message: "Payment verified",
//       orderId: data.orderId,
//       txnStatus: data.txnStatus || "UNKNOWN",
//       data
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

const merchantIdentifier = process.env.ZAAKPAY_MERCHANT_ID; // LIVE credentials
const secretKey = process.env.ZAAKPAY_SECRET_KEY;            // LIVE credentials

// 🔹 Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const orderId = "ORDER_" + Date.now(); // unique orderId

    const params = {
      merchantIdentifier,
      orderId,
      returnUrl: "https://api.jajamblockprints.com/api/payment/callback",
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
      zpPayOption: "1", // All payment modes
      mode: "0",
      currency: "INR",
      amount: "20000", // 200.00 INR
      merchantIpAddress: req.ip || "127.0.0.1",
      txnDate: new Date().toISOString().slice(0, 10),
      purpose: "0",
      productDescription: "Test Product",
    };

    // ✅ checksum generate karo
    params.checksum = generateChecksum(params, secretKey);

    // ✅ HTML return karo
    res.send(`
      <html>
        <body onload="document.forms[0].submit()">
          <form action="https://api.zaakpay.com/transactD?v=8" method="post">
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

// 🔹 Callback
export const paymentCallback = async (req, res) => {
  try {
    const data = req.body;
    console.log("🔁 Zaakpay Callback Response:", data);

    const receivedChecksum = data.checksum;
    delete data.checksum; // verify ke liye hatao

    const isValid = verifyChecksum(data, receivedChecksum, secretKey);

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
