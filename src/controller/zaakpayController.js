// import crypto from "crypto";
// import qs from "querystring";

// // Zaakpay Payin Controller
// export const zaakpayPayin = async (req, res) => {
//   try {
//     const {
//       amount,
//       email,
//       name,
//       mobile,
//       reference
//     } = req.body;

//     // ✅ Hardcoded Zaakpay credentials
//     const merchantIdentifier = "b19e8f103bce406cbd3476431b6b7973";
//     const secretKey = "0678056d96914a8583fb518caf42828a";
//     const returnUrl = "https://api.worldpayme.com/api/zaakpay/callback";

//     // Convert amount to paisa
//     const amountInPaisa = amount * 100;

//     // Generate unique order ID
//     const orderId = `ZAAK${Date.now()}`;

//     // Prepare params for checksum
//     const params = {
//       amount: amountInPaisa,
//       buyerAddress: "India",
//       buyerCity: "Delhi",
//       buyerCountry: "IND",
//       buyerEmail: email,
//       buyerFirstName: name,
//       buyerLastName: "User",
//       buyerPhoneNumber: mobile,
//       buyerPincode: "110001",
//       buyerState: "Delhi",
//       currency: "INR",
//       merchantIdentifier,
//       orderId,
//       productDescription: "Zaakpay Payment",
//       returnUrl,
//       txnType: "1",
//       zpPayOption: "1"
//     };

//     // Filter out null/undefined
//     const filteredParams = Object.entries(params).filter(([k, v]) => v !== undefined && v !== null && v !== "");

//     // Sort alphabetically by key
//     filteredParams.sort((a, b) => a[0].localeCompare(b[0]));

//     // Create query string
//     const queryString = filteredParams.map(([k, v]) => `${k}=${v}`).join("&");

//     // Generate HMAC SHA256 checksum
//     const checksum = crypto.createHmac("sha256", secretKey)
//       .update(queryString)
//       .digest("hex");

//     // Add checksum to params
//     const finalParams = { ...params, checksum };

//     // Send HTML form to client for redirection
//     const formFields = Object.entries(finalParams)
//       .map(([key, val]) => `<input type="hidden" name="${key}" value="${val}"/>`)
//       .join("");

//     const html = `
//       <html>
//         <body onload="document.forms[0].submit()">
//           <form method="POST" action="https://zaakstaging.zaakpay.com/api/paymentTransact/V8">
//             ${formFields}
//           </form>
//         </body>
//       </html>
//     `;

//     res.send(html);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong in Zaakpay Payin" });
//   }
// };



import crypto from "crypto";
import qs from "querystring";
// import VirtualAccountTransaction from "../models/VirtualAccountTransaction.js"; // optional if using DB

// ✅ Zaakpay LIVE credentials
const merchantId = "236e6378d80e492f95283a119417ef01";
const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
const apiUrl = "https://api.zaakpay.com/api/paymentTransact/V8"; // ✅ Live Endpoint

export const zaakpayPayin = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user || {}; // if available via auth middleware

    // ✅ Generate Order ID & Convert amount to paisa
    const orderId = "ZAAK" + Date.now();
    const amountInPaisa = Math.round(data.amount * 100);

    // ✅ Callback / Return URL
    const returnUrl = "https://api.worldpayme.com/api/zaakpay/callback";

    // ✅ Prepare Zaakpay Params
    const params = {
      merchantIdentifier: merchantId,
      orderId: orderId,
      amount: amountInPaisa,
      currency: "INR",
      buyerEmail: data.email,
      buyerFirstName: data.name,
      buyerLastName: "User",
      buyerAddress: "India",
      buyerCity: "Delhi",
      buyerState: "Delhi",
      buyerCountry: "IND",
      buyerPincode: "110001",
      buyerPhoneNumber: data.mobile,
      returnUrl: returnUrl,
      productDescription: "Zaakpay Payment"
    };

    // ✅ Generate Checksum (same as PHP)
    const checksum = generateZaakpayChecksum(params, secretKey);
    params.checksum = checksum;

    // ✅ (Optional) Save transaction before redirect
    /*
    const txn = new VirtualAccountTransaction({
      customerId: user?._id || "guest",
      transactionNo: data.reference,
      amount: data.amount,
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      apiTransactionNo: orderId,
      status: "0", // pending
      apiPartner: "zaakpay"
    });
    await txn.save();
    */

    // ✅ Build Payment URL (redirect like PHP)
    const queryString = qs.stringify(params);
    const paymentUrl = `${apiUrl}?${queryString}`;

    // ✅ Return success response
    return res.json({
      status: "success",
      message: "Zaakpay Payment URL generated successfully.",
      payment_url: paymentUrl
    });

  } catch (error) {
    console.error("Zaakpay Payin Error:", error);
    return res.status(500).json({
      status: "failed",
      data: null,
      message: `Zaakpay integration failed: ${error.message}`
    });
  }
};

// ✅ Helper function to generate Zaakpay checksum
const generateZaakpayChecksum = (data, key, algo = "sha256") => {
  // remove null/empty values
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null && v !== "")
  );

  // sort by key
  const sortedKeys = Object.keys(filtered).sort();
  const queryString = sortedKeys.map(k => `${k}=${filtered[k]}`).join("&");

  // append secret key like PHP
  const finalString = `${queryString}|${key}`;

  // generate hash
  return crypto.createHash(algo).update(finalString).digest("hex");
};
