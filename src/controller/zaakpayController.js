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

// ✅ LIVE ENVIRONMENT
const merchantId = "236e6378d80e492f95283a119417ef01";
const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
const apiUrl = "https://api.zaakpay.com/api/paymentTransact/V8";

// ✅ STAGING ENVIRONMENT (use only for test)
// const merchantId = "b19e8f103bce406cbd3476431b6b7973";
// const secretKey = "0678056d96914a8583fb518caf42828a";
// const apiUrl = "https://zaakstaging.zaakpay.com/api/paymentTransact/V8";

const generateZaakpayChecksum = (data, key) => {
  const sortedKeys = Object.keys(data)
    .filter(k => data[k] !== undefined && data[k] !== "")
    .sort();

  const plainText = sortedKeys.map(k => `${k}=${data[k]}`).join("&");
  const checksumString = key + plainText; // ✅ secretKey first

  console.log("🔹 Checksum Plain Text:", checksumString);

  return crypto.createHash("sha256").update(checksumString, "utf8").digest("hex");
};

export const zaakpayPayin = async (req, res) => {
  try {
    const { amount, email } = req.body;

    const amountInPaise = (amount * 100).toString();

    const params = {
      amount: amountInPaise,
      buyerFirstName: "Rahul",
      buyerEmail: email,
      currency: "INR",
      merchantIdentifier: merchantId,
      orderId: `ZAAK${Date.now()}`,
      productDescription: "Test Transaction",
      returnUrl: "https://jajamblockprints.com/api/status",
    };

    // ✅ Generate checksum
    const checksum = generateZaakpayChecksum(params, secretKey);

    // ✅ Build query string
    const queryString = Object.entries({ ...params, checksum })
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const paymentUrl = `${apiUrl}?${queryString}`;

    return res.json({
      success: true,
      message: "Zaakpay payment URL generated successfully",
      paymentUrl,
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
      } else {
        console.log("❌ Payment Failed for Order:", response.orderId);
      }

      return res.send(`<h3>Payment status updated successfully.</h3>`);
    } else {
      console.log("❌ Invalid checksum received in callback");
      return res.status(400).send("Invalid checksum received.");
    }
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).send("Internal Server Error in Callback");
  }
};


// const generateZaakpayChecksum = (data, key) => {
//   const sortedKeys = Object.keys(data)
//     .filter(k => data[k] !== undefined && data[k] !== "")
//     .sort();

//   const plainText = sortedKeys.map(k => `${k}=${data[k]}`).join("&");
//   const finalString = `${plainText}|${key}`;

//   console.log("🔹 Checksum Plain Text:", finalString);

//   return crypto.createHash("sha256").update(finalString).digest("hex");
// };

// export const zaakpayPayin = async (req, res) => {
//   try {
//     const { amount, email } = req.body;

//     // ✅ Convert amount to paisa
//     const amountInPaisa = amount * 100;

//     // ✅ Updated params with returnUrl and productDescription
//     const params = {
//       amount: amountInPaisa.toString(),
//       buyerFirstName: "Rahul",
//       buyerEmail: email,
//       currency: "INR",
//       merchantIdentifier: merchantId,
//       orderId: `ZAAK${Date.now()}`,
//       productDescription: "Test Transaction",
//       returnUrl: "https://jajamblockprints.com/api/status",
//     };

//     const checksum = generateZaakpayChecksum(params, secretKey);

//     const queryString = Object.entries({ ...params, checksum })
//       .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
//       .join("&");

//     const paymentUrl = `${apiUrl}?${queryString}`;

//     return res.json({
//       success: true,
//       message: "Zaakpay payment URL generated successfully",
//       paymentUrl,
//     });
//   } catch (error) {
//     console.error("Zaakpay Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Zaakpay integration failed",
//       error: error.message,
//     });
//   }
// };

// export const zaakpayCallback = async (req, res) => {
//   try {
//     const response = req.body;
//     console.log("✅ Zaakpay Callback Response:", response);

//     // ✅ Extract checksum from Zaakpay response
//     const receivedChecksum = response.checksum;
//     delete response.checksum;

//     // ✅ Recreate checksum from received params
//     const calculatedChecksum = generateZaakpayChecksum(response, secretKey);

//     if (receivedChecksum === calculatedChecksum) {
//       console.log("✅ Checksum verified successfully");

//       // Example: Handle payment success/failure
//       if (response.responseCode === "100") {
//         console.log("🎉 Payment Successful for Order:", response.orderId);
//         // TODO: Update booking/payment status to "success"
//       } else {
//         console.log("❌ Payment Failed for Order:", response.orderId);
//         // TODO: Update booking/payment status to "failed"
//       }

//       return res.send(`<h3>Payment status updated successfully.</h3>`);
//     } else {
//       console.log("❌ Invalid checksum received in callback");
//       return res.status(400).send("Invalid checksum received.");
//     }

//   } catch (error) {
//     console.error("Callback Error:", error);
//     res.status(500).send("Internal Server Error in Callback");
//   }
// };
