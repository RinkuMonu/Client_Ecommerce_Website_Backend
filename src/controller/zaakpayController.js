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


const merchantId = "236e6378d80e492f95283a119417ef01";
const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
const apiUrl = "https://api.zaakpay.com/api/paymentTransact/V8"; // ✅ Live Endpoint

export const zaakpayPayin = async (req, res) => {
  try {
    const data = req.body;

    const orderId = "ZAAK" + Date.now();
    const amountInPaisa = Math.round(data.amount * 100);
    const returnUrl = "https://api.worldpayme.com/api/zaakpay/callback";

    // ✅ Parameters (correct Zaakpay order)
    const params = {
      amount: amountInPaisa,
      bankid: "",
      buyerAddress: "India",
      buyerCity: "Delhi",
      buyerCountry: "IND",
      buyerEmail: data.email,
      buyerFirstName: data.name,
      buyerLastName: "User",
      buyerPhoneNumber: data.mobile,
      buyerPincode: "110001",
      buyerState: "Delhi",
      currency: "INR",
      debitorcredit: "",
      merchantIdentifier: merchantId,
      merchantIpAddress: "101.53.144.53",
      mode: "0",
      orderId: orderId,
      product1Description: "",
      product2Description: "",
      product3Description: "",
      product4Description: "",
      productDescription: "Zaakpay Payment",
      productInfo: "",
      purpose: "",
      returnUrl: returnUrl,
      shipToAddress: "",
      shipToCity: "",
      shipToCountry: "",
      shipToFirstname: "",
      shipToLastname: "",
      shipToPhoneNumber: "",
      shipToPincode: "",
      shipToState: "",
      showMobile: "",
      txnDate: "",
      txnType: "1",
      paymentOptionTypes: "",
      zpPayOption: "1"
    };

    // ✅ Generate checksum
    const checksum = generateZaakpayChecksum(params, secretKey);
    params.checksum = checksum;

    // ✅ Generate HTML Form
    const formFields = Object.entries(params)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join("\n");

    const html = `
      <html>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${apiUrl}">
            ${formFields}
          </form>
        </body>
      </html>
    `;

    // ✅ Send HTML directly to browser
    res.set("Content-Type", "text/html");
    return res.send(html);

  } catch (error) {
    console.error("Zaakpay Payin Error:", error);
    return res.status(500).json({
      status: "failed",
      message: `Zaakpay integration failed: ${error.message}`
    });
  }
};

const generateZaakpayChecksum = (data, key) => {
  const keysInOrder = [
    "amount", "bankid", "buyerAddress", "buyerCity", "buyerCountry",
    "buyerEmail", "buyerFirstName", "buyerLastName", "buyerPhoneNumber",
    "buyerPincode", "buyerState", "currency", "debitorcredit",
    "merchantIdentifier", "merchantIpAddress", "mode", "orderId",
    "product1Description", "product2Description", "product3Description",
    "product4Description", "productDescription", "productInfo", "purpose",
    "returnUrl", "shipToAddress", "shipToCity", "shipToCountry",
    "shipToFirstname", "shipToLastname", "shipToPhoneNumber",
    "shipToPincode", "shipToState", "showMobile", "txnDate", "txnType",
    "paymentOptionTypes", "zpPayOption"
  ];

  // ✅ Include even empty fields
  const checksumString = keysInOrder
    .map(k => `${k}=${data[k] !== undefined ? data[k] : ""}`)
    .join("&");

  const finalString = `${checksumString}|${key}`;
  return crypto.createHash("sha256").update(finalString).digest("hex");
};
