// import axios from "axios";
// import qs from "qs";
// import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

// export const initiatePayment = async (req, res) => {
//   try {
//     const merchantId = process.env.ZAAKPAY_MERCHANT_ID;
//     const secretKey = process.env.ZAAKPAY_SECRET_KEY;
//     const callbackUrl = process.env.ZAAKPAY_CALLBACK_URL;
//     const endpoint = process.env.ZAAKPAY_ENDPOINT;

//     const orderId = "ORDER_" + Date.now();

//     // Zaakpay requires full timestamp: YYYY-MM-DD HH:mm:ss
//     const txnDate = new Date().toISOString().replace("T", " ").split(".")[0];

//     // 🔹 Build payload as per docs
//     const payload = {
//       merchantIdentifier: merchantId,
//       merchantIpAddress: "127.0.0.1", // later replace with req.ip
//       showMobile: "true",
//       mode: "0",
//       returnUrl: callbackUrl,
//       orderDetail: {
//         orderId,
//         amount: "2000", // in paisa (₹20)
//         currency: "INR",
//         purpose: "1",
//         productDescription: "UPI P2M Collect",
//         email: "testuser@example.com",
//         txnDate,
//       },
//       billingAddress: {
//         firstName: "Test_FirstName",
//         lastName: "Test_LastName",
//         address: "Sector 56",
//         city: "Gurugram",
//         state: "Haryana",
//         country: "India",
//         pincode: "122003",
//         phoneNumber: "9999999999",
//       },
//       shippingAddress: {
//         address: "Sector 54",
//         city: "Gurugram",
//         state: "Haryana",
//         country: "India",
//         pincode: "122003",
//       },
//       paymentInstrument: {
//         paymentMode: "UPI",
//         upi: {
//           vpa: "testvpa@upi", // test VPA
//         },
//       },
//       debitorcredit: "upi",
//     };

//     // 🔹 Convert payload to JSON string
//     const jsonString = JSON.stringify(payload);

//     // 🔹 Generate checksum
//     const checksum = generateChecksum(jsonString, secretKey);

//     // 🔹 Send request to Zaakpay TransactU
//     const response = await axios.post(
//       endpoint,
//       qs.stringify({ data: jsonString, checksum }),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     // 🔹 Return Zaakpay response to frontend
//     res.json({
//       message: "Payment initiation request sent",
//       orderId,
//       response: response.data,
//     });
//   } catch (err) {
//     console.error("❌ Error in initiatePayment:", err.response?.data || err.message);
//     res.status(500).json({ error: err.message, details: err.response?.data });
//   }
// };

// export const initiatePayment = async (req, res) => {
//   try {
//     const merchantId = process.env.ZAAKPAY_MERCHANT_ID;
//     const secretKey = process.env.ZAAKPAY_SECRET_KEY;
//     const endpoint = "https://zaakstaging.zaakpay.com/transactU?v=8";
//     const callbackUrl = process.env.ZAAKPAY_CALLBACK_URL;

//     const orderId = "ORDER_" + Date.now();
//     const txnDate = new Date().toISOString().split("T")[0];

//     // -----------------------
//     // 🔹 Card Static Payload
//     // -----------------------
//     const cardPayload = {
//       merchantIdentifier: merchantId,
//       merchantIpAddress: "127.0.0.1",
//       showMobile: "true",
//       mode: "0",
//       returnUrl: callbackUrl,
//       orderDetail: {
//         orderId,
//         amount: "2000",
//         currency: "INR",
//         productDescription: "Card Test",
//         email: "testcard@example.com",
//         txnDate,
//       },
//       paymentInstrument: {
//         paymentMode: "card",
//         card: {
//           encrypted_pan: "ZIELDi7yDpepfoUguuQ8LoxFnJiF9ptu...",  // docs sample
//           nameoncard: "Test Jagat",
//           encryptedcvv: "LPVY/wl4Fy6FxiyyIEjILBUBtCMVQyB...", // docs sample
//           encrypted_expiry_month: "HPbVqDZ5Ka6G9UNTw6Hffq...",        // docs sample
//           encrypted_expiry_year: "hLKmluu9mZtie6VjizrC0g..."        // docs sample
//         }
//       }
//     };

//     // -----------------------
//     // 🔹 NetBanking Static Payload
//     // -----------------------
//     const netbankingPayload = {
//       merchantIdentifier: merchantId,
//       merchantIpAddress: "127.0.0.1",
//       showMobile: "true",
//       mode: "0",
//       returnUrl: callbackUrl,
//       orderDetail: {
//         orderId,
//         amount: "2000",
//         currency: "INR",
//         productDescription: "NetBanking Test",
//         email: "testnetbank@example.com",
//         phone: "9999999999",
//         txnDate,
//       },
//       paymentInstrument: {
//         paymentMode: "netbanking",
//         netbanking: {
//           bankid: "HDF" // HDFC
//         }
//       }
//     };

//     // -----------------------
//     // 🔹 UPI Static Payload
//     // -----------------------
//     const upiPayload = {
//       merchantIdentifier: merchantId,
//       merchantIpAddress: "127.0.0.1",
//       showMobile: "true",
//       mode: "0",
//       returnUrl: callbackUrl,
//       orderDetail: {
//         orderId,
//         amount: "2000",
//         currency: "INR",
//         productDescription: "UPI Test",
//         email: "testupi@example.com",
//         txnDate,
//       },
//       paymentInstrument: {
//         paymentMode: "UPI",
//         netbanking: {
//           bankid: "testvpa@upi" // Static VPA
//         }
//       },
//       debitorcredit: "upi"
//     };

//     // -----------------------
//     // 🔹 Wallet Static Payload
//     // -----------------------
//     const walletPayload = {
//       merchantIdentifier: merchantId,
//       merchantIpAddress: "127.0.0.1",
//       showMobile: "true",
//       mode: "0",
//       returnUrl: callbackUrl,
//       orderDetail: {
//         orderId,
//         amount: "2000",
//         currency: "INR",
//         productDescription: "Wallet Test",
//         email: "testwallet@example.com",
//         phone: "9876543210",
//         txnDate,
//       },
//       paymentInstrument: {
//         paymentMode: "wallet",
//         wallet: {
//           walletName: "paytm"  // options: paytm, mobikwik, freecharge etc. (as per Zaakpay docs)
//         }
//       }
//     };

//     // -----------------------
//     // Select Mode by query param
//     // -----------------------
//     const { mode } = req.query; // ?mode=card|netbanking|upi|wallet
//     let payload = upiPayload; // default

//     if (mode === "card") payload = cardPayload;
//     if (mode === "netbanking") payload = netbankingPayload;
//     if (mode === "upi") payload = upiPayload;
//     if (mode === "wallet") payload = walletPayload;

//     const jsonString = JSON.stringify(payload);
//     const checksum = generateChecksum(jsonString, secretKey);

//     const response = await axios.post(
//       endpoint,
//       qs.stringify({ data: jsonString, checksum }),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     res.json({
//       message: "Zaakpay Payment Initiated",
//       paymentMode: payload.paymentInstrument.paymentMode,
//       orderId,
//       response: response.data,
//     });
//   } catch (err) {
//     console.error("❌ Zaakpay Error:", err.response?.data || err.message);
//     res.status(500).json({ error: err.message, details: err.response?.data });
//   }
// };

// ---------------------------------------------------------
// 🔹 Callback Handler
// ---------------------------------------------------------

// export const paymentCallback = async (req, res) => {
//   try {
//     const secretKey = process.env.ZAAKPAY_SECRET_KEY;
//     const { data, checksum } = req.body;

//     if (!data || !checksum) {
//       return res.status(400).json({ error: "Invalid callback data" });
//     }

//     const isValid = verifyChecksum(data, checksum, secretKey);
//     if (!isValid) {
//       return res.status(400).json({ error: "Checksum mismatch" });
//     }

//     const parsedData = JSON.parse(data);

//     console.log("✅ Zaakpay Callback Response:", parsedData);

//     // TODO: Save status in DB here
//     // Example: update order status by parsedData.orderId

//     res.json({ message: "Callback received", parsedData });
//   } catch (err) {
//     console.error("❌ Callback Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };



import axios from "axios";
import qs from "qs";
import { generateChecksum, verifyChecksum } from "../../utils/checksum.js";

/**
 * POST /api/zaakpay/initiate?mode=card|netbanking|upi|wallet
 * Initiates a payment using Zaakpay Custom Checkout (TransactU v=8).
 * All payloads are static and docs-accurate; switch mode via query param.
 */
export async function initiatePayment(req, res) {
  try {
    const merchantIdentifier = process.env.ZAAKPAY_MERCHANT_ID;   // e.g. b19e...
    const secretKey         = process.env.ZAAKPAY_SECRET_KEY;     // HMAC key
    const callbackUrl       = process.env.ZAAKPAY_CALLBACK_URL;   // must match dashboard URL (domain/subdomain)
    const endpoint          = process.env.ZAAKPAY_ENDPOINT || "https://zaakstaging.zaakpay.com/transactU?v=8";

    const orderId = "ORDER_" + Date.now();
    const txnDate = new Date().toISOString().replace("T", " ").split(".")[0];

    // ─────────────────────────────────────────────────────────────────────
    // CARD (requires RSA encryption + encryptionKeyId)
    // NOTE: Replace encrypted_* fields with your own RSA-encrypted values.
    //       Use Zaakpay "public key" (from dashboard) to encrypt.
    //       Include *encryptionKeyId* from dashboard (required for card).
    // ─────────────────────────────────────────────────────────────────────
    const cardPayload = {
      merchantIdentifier,
      encryptionKeyId: process.env.ZAAKPAY_ENCRYPTION_KEY_ID || "YPQH44top9yNaY4", // <-- put your real encryptionKeyId
      merchantIpAddress: "127.0.0.1",
      showMobile: "true",
      mode: "0",
      returnUrl: callbackUrl,
      orderDetail: {
        orderId,
        amount: "2000", // paisa (₹20.00)
        currency: "INR",
        purpose: "1",
        productDescription: "Test Card Transaction",
        email: "testcard@example.com",
        txnDate
      },
      paymentInstrument: {
        paymentMode: "card",
        card: {
          encrypted_pan: "ZIELDi7yDpepfoUguuQ8LoxFnJiF9ptuVt17vcFiG/eL8rZ7FqeVj8V5B7O1s5uk6b+3QobMVawQ\nD3ip81MQIl+NsIgC2KHmkGiUzHzlS/TppENrefWnOKEQDKYU1yonIhSfFL9TZittoXwvnfn0TaIY\nNk6oPpFcQsA4KEC4nQCwiYXgbGzVFhKtdlRtI4nWCrXvEr9KerG3alRGysIRfCKxIiB2GRD3O4hM\nXgZExTTUWs37Dy73unqLfQgwyfdG5qpMAyMNN8xrU1dM/EXiGWpe9xYO0zfN0Mqs4aA+WFRjS5I8\nUXfcANA77ShYrv1eEsatSsY6x9248BnE0+eDpQ==",
          nameoncard: "Test Jagat",
          encryptedcvv: "LPVY/wl4Fy6FxiyyIEjILBUBtCMVQyBagcYgFqYce0aTUTv8PEo5OJAd3Qtq/RzwicZ6+mj1R6v/\nj8rWrPkFrob7SkbZkJ0TRweD6Pxh/nHDjG6eKeBnjhGijf/tOuKs61PCIfKGroK63KPOP6rohc8y\n75cdFt+ItTeRi03PGDjI5WUdhOLB4wtw7v+ztWLZksQ9EAu4H8P29CO6FlQMepAPV6xEtdud4uly\nuJRjSRGKtcSVfWguBe7uWIvpmD+bvlTt2rv+HmKG2Fegaxt4XgKhVd3wEHNiF7RZIzIPo826efuK\nXENmj+LRxaQIoba1eD0rsQ9AwVKN+qfnpS4Rfw==",
          encrypted_expiry_month: "HPbVqDZ5Ka6G9UNTw6Hffq/4SipvzfC7CKdY6287I3ECSYxUG5NVPr7L6hOVj8vdq2nTpk7TuYzi\nKAvshZo0/VWQ0bJboKlSu8Pu51YptAazUFKWgPNQAE/h3mEhrNIkj6z0EL9oGCE2eEdtSfuCkh2F\nI9OYIs60iPxs9DoFAQjUBdtmxde9ToASPV6FdtoAfBMar7Oo4hHTvJANoCrRO2EaeqJ9f4yjFxlc\nDr6BQ2S3avnPOf0SFviiVrpeMFM5LgL3k7xelUhOT0mJexn4m6gyj65gJ+eKIQcDKRs4BJGsY+kK\n/YF7s7tvT3kMAfQ8zkvwzdt2XDRqa3LARKJMaA==",
          encrypted_expiry_year: "hLKmluu9mZtie6VjizrC0gKZU8/I3jRR0EbSpaPZFoLO9JAvuARtIfAFbqQSpsfFqjVgkLoZechH\nGELjapDdi0l8jtUSQBAneJF7loS80/y8pSTG0lSFhUVgmUAhANQR3SSTHMi5+uuFAbpDFiW/al/B\nr0MhfUaDohW3zr6SzT699hKSxYZmiRzGThVmdOMSzBulJn2XRTnd1F/KT0+aS4QZkiB2I6xwquaG\nHCSGCUKu10Gf7rlLBYrixsBcixIczoqfG8tEPDyI77pLurKVP0ORHiT5LVsP6wcqBejQ/bVIfotS\nqWmobMaipM7V/8+R0OG4AJoGOaePkclfHzF6Hg==",
          saveCard: "false"
        }
      }
    };

    // ─────────────────────────────────────────────────────────────────────
    // NETBANKING (bankid from Zaakpay list; e.g., HDFC = HDF, SBI = SBI)
    // ─────────────────────────────────────────────────────────────────────
    const netbankingPayload = {
      merchantIdentifier,
      merchantIpAddress: "127.0.0.1",
      showMobile: "true",
      mode: "0",
      returnUrl: callbackUrl,
      orderDetail: {
        orderId,
        amount: "2000",
        currency: "INR",
        productDescription: "NetBanking Test",
        email: "testnetbank@example.com",
        phone: "9999999999",
        txnDate
      },
      paymentInstrument: {
        paymentMode: "netbanking",
        netbanking: { bankid: "HDF" } // HDFC
      }
    };

    // ─────────────────────────────────────────────────────────────────────
    // UPI COLLECT (bankid = VPA; debitorcredit = "upi")
    // ─────────────────────────────────────────────────────────────────────

const upiPayload = {
  merchantIdentifier,
  merchantIpAddress: "127.0.0.1",
  showMobile: "true",
  mode: "0",
  returnUrl: callbackUrl,
  orderDetail: {
    orderId,
    amount: "2000", // paisa me (₹20)
    currency: "INR",
    purpose: "1",
    productDescription: "UPI Collect Test",
    email: "testupi@example.com",
    txnDate
  },
  paymentInstrument: {
    paymentMode: "UPI",
    upi: { vpa: "testvpa@upi" }  // ✅ correct field
  },
  debitorcredit: "upi"
};

    // ─────────────────────────────────────────────────────────────────────
    // WALLET (per docs, wallet also travels via netbanking.bankid code)
    // Example from docs shows Mobikwik "MW" as bankid for wallet
    // ─────────────────────────────────────────────────────────────────────
    const walletPayload = {
  merchantIdentifier,
  merchantIpAddress: "127.0.0.1",
  showMobile: "true",
  mode: "0",
  returnUrl: callbackUrl,
  orderDetail: {
    orderId,
    amount: "2000",
    currency: "INR",
    purpose: "1",
    productDescription: "Wallet Test",
    email: "testwallet@example.com",
    phone: "8894451510",
    txnDate
  },
  paymentInstrument: {
    paymentMode: "wallet",
    wallet: {
      walletName: "paytm"   // ya mobikwik, freecharge etc. as per Zaakpay docs
    }
  }
};

    // Choose by query param (?mode=card|netbanking|upi|wallet)
    const mode = (req.query.mode || "upi").toLowerCase();
    let payload = upiPayload;
    if (mode === "card") payload = cardPayload;
    else if (mode === "netbanking") payload = netbankingPayload;
    else if (mode === "wallet") payload = walletPayload;

    const data = JSON.stringify(payload);
    const checksum = generateChecksum(data, secretKey);

    const zp = await axios.post(
      endpoint,
      qs.stringify({ data, checksum }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // Return whatever Zaakpay sent — may contain doRedirect/postUrl/bankPostData etc.
    res.status(200).json({
      success: true,
      mode: payload.paymentInstrument.paymentMode,
      orderId,
      zaakpay: zp.data
    });
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error("Zaakpay initiate error:", detail);
    res.status(500).json({ success: false, message: "Initiation failed", detail });
  }
}

/**
 * POST /api/zaakpay/callback
 * Zaakpay posts back data + checksum (x-www-form-urlencoded).
 * We verify checksum and echo parsed data.
 * NOTE: Make sure body-parser for urlencoded is enabled app-wide.
 */
export async function paymentCallback(req, res) {
  try {
    const secretKey = process.env.ZAAKPAY_SECRET_KEY;

    // Zaakpay sends: data=<json>&checksum=<hex>
    const { data, checksum } = req.body || {};
    if (!data || !checksum) {
      return res.status(400).json({ success: false, message: "Missing data or checksum" });
    }

    // verify HMAC checksum
    const ok = verifyChecksum(data, checksum, secretKey);
    if (!ok) {
      return res.status(400).json({ success: false, message: "Checksum mismatch" });
    }

    const parsed = JSON.parse(data);

    // Typical fields:
    // parsed.responseCode === "100" => success
    // parsed.responseDescription
    // parsed.orderDetail.orderId, amount, etc.
    // If doRedirect=false for card without 2FA, this could be final response.
    // Otherwise user/browser redirection to bank 2FA is required per initial response.

    // TODO: persist/update order status here (DB write)
    // e.g., await Orders.updateOne({ orderId: parsed.orderDetail.orderId }, { status: parsed.responseCode })

    res.status(200).json({
      success: true,
      verified: true,
      status: parsed.responseCode === "100" ? "success" : "failed",
      data: parsed
    });
  } catch (err) {
    console.error("Zaakpay callback error:", err.message);
    res.status(500).json({ success: false, message: "Callback processing failed" });
  }
}