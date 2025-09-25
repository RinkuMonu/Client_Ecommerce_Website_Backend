import express from "express";
import crypto from "crypto";

const router = express.Router();

// Utility: Generate HMAC SHA-256 checksum
const generateChecksum = (dataString, secretKey) => {
    return crypto.createHmac("sha256", secretKey).update(dataString).digest("hex");
};

// 🔹 POST /api/zaakpay/pay
router.post("/pay", async (req, res) => {
    try {
        // ===== Zaakpay credentials (replace with your live keys) =====
        const merchantIdentifier = "236e6378d80e492f95283a119417ef01"; // ✅ merchant ID
        const secretKey = "6b86b801cd5e4822b1fb2fa6528213d4";       // ✅ secret key

        // ===== Transaction data =====
        const orderId = "ORDER_" + Date.now(); // unique per txn
        const mode = "0"; // domain check skip
        const currency = "INR";
        const amount = "10000"; // ₹100 in paise
        const merchantIpAddress = "127.0.0.1";
        const txnDate = new Date().toISOString().split("T")[0];

        // ===== Buyer details =====
        const buyerEmail = "rahul@gmail.com";
        const buyerFirstName = "Rahul";
        const buyerLastName = "Sharma";
        const buyerAddress = "Connaught Place";
        const buyerCity = "Delhi";
        const buyerState = "Delhi";
        const buyerCountry = "India";
        const buyerPincode = "110001";
        const buyerPhoneNumber = "9999999999";

        // ===== Mandatory params for checksum =====
        const checksumString = `'${merchantIdentifier}''${orderId}''${mode}''${currency}''${amount}''${merchantIpAddress}''${txnDate}'`;
        const checksum = generateChecksum(checksumString, secretKey);

        // ===== HTML Form (auto-submit) =====
        const htmlForm = `
      <html>
      <body onload="document.forms[0].submit()">
        <form action="https://api.zaakpay.com/transactD?v=5" method="post">
          <input type="hidden" name="merchantIdentifier" value="${merchantIdentifier}" />
          <input type="hidden" name="orderId" value="${orderId}" />
          <input type="hidden" name="returnUrl" value="https://api.jajamblockprints.com/api/payment/callback" />
          <input type="hidden" name="buyerEmail" value="${buyerEmail}" />
          <input type="hidden" name="buyerFirstName" value="${buyerFirstName}" />
          <input type="hidden" name="buyerLastName" value="${buyerLastName}" />
          <input type="hidden" name="buyerAddress" value="${buyerAddress}" />
          <input type="hidden" name="buyerCity" value="${buyerCity}" />
          <input type="hidden" name="buyerState" value="${buyerState}" />
          <input type="hidden" name="buyerCountry" value="${buyerCountry}" />
          <input type="hidden" name="buyerPincode" value="${buyerPincode}" />
          <input type="hidden" name="buyerPhoneNumber" value="${buyerPhoneNumber}" />
          <input type="hidden" name="txnType" value="1" />
          <input type="hidden" name="zpPayOption" value="1" />
          <input type="hidden" name="mode" value="${mode}" />
          <input type="hidden" name="currency" value="${currency}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="merchantIpAddress" value="${merchantIpAddress}" />
          <input type="hidden" name="txnDate" value="${txnDate}" />
          <input type="hidden" name="purpose" value="0" />
          <input type="hidden" name="productDescription" value="Test Product" />
          <input type="hidden" name="debitorcredit" value="wallet" />
          <input type="hidden" name="bankid" value="MW" />
          <input type="hidden" name="showMobile" value="true" />
          <input type="hidden" name="checksum" value="${checksum}" />
        </form>
        <p>Redirecting to Zaakpay... Please wait.</p>
      </body>
      </html>
    `;

        res.status(200).send(htmlForm);
    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).send("Payment request failed.");
    }
});


router.post("/callback", (req, res) => {
    try {
        const secretKey = "6b86b801cd5e4822b1fb2fa6528213d4";

        const {
            orderId,
            responseCode,
            responseDescription,
            amount,
            doRedirect,
            paymentMode,
            bankid,
            productDescription,
            pgTransId,
            pgTransTime,
            checksum,
        } = req.body;

        // Convert everything to string safely
        const fields = [
            orderId,
            responseCode,
            responseDescription,
            amount,
            doRedirect,
            paymentMode,
            bankid,
            productDescription,
            pgTransId,
            pgTransTime,
        ].map((val) => `'${val !== undefined && val !== null ? String(val) : ""}'`);

        const checksumString = fields.join("");

        const calculatedChecksum = generateChecksum(checksumString, secretKey);

        console.log("String Used    :", checksumString);
        console.log("Zaakpay Checksum:", checksum);
        console.log("Our Calculated :", calculatedChecksum);

        if (calculatedChecksum === checksum && responseCode === "100") {
            console.log("✅ Payment success for", orderId);
            // Update DB as Paid
            res.status(200).send("Payment verified successfully");
        } else {
            console.log("❌ Payment failed or checksum mismatch");
            res.status(400).send("Checksum mismatch or failed txn");
        }
    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).send("Server error");
    }
});


export default router;
