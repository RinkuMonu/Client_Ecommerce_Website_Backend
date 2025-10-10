import crypto from "crypto";
import qs from "querystring";
// import VirtualAccountTransaction from "../models/VirtualAccountTransaction.js"; // adjust path

export const zaakpayPayin = async (req, res) => {
    try {
        const data = req.body;

        // ✅ Zaakpay staging credentials
        const merchantId = "b19e8f103bce406cbd3476431b6b7973";
        const secretKey = "0678056d96914a8583fb518caf42828a";

        // ✅ Zaakpay API endpoint (staging)
        const apiUrl = "https://api.zaakpay.com";

        // ✅ Order ID (unique for every transaction)
        const orderId = "ZPTest_" + Date.now();

        // ✅ Amount should be in paisa (200 INR => 20000)
        const amount = String(parseInt(data.amount) * 100);

        // ✅ All params in correct order
        const params = {
            amount: amount,
            bankid: data.bankid || "",
            buyerAddress: data.buyerAddress || "",
            buyerCity: data.buyerCity || "",
            buyerCountry: data.buyerCountry || "IND",
            buyerEmail: data.email || "abc@abc.com",
            buyerFirstName: data.firstName || "",
            buyerLastName: data.lastName || "",
            buyerPhoneNumber: data.phone || "",
            buyerPincode: data.pincode || "",
            buyerState: data.buyerState || "",
            currency: "INR",
            isAutoRedirect: "true",
            debitorcredit: data.debitorcredit || "",
            merchantIdentifier: merchantId,
            merchantIpAddress: req.ip || "127.0.0.1",
            mode: "0",
            orderId: orderId,
            product1Description: data.product1 || "",
            product2Description: data.product2 || "",
            product3Description: data.product3 || "",
            product4Description: data.product4 || "",
            productDescription: data.productDescription || "Test Product",
            productInfo: data.productInfo || "",
            purpose: data.purpose || "0",
            returnUrl: data.returnUrl || "https://api.zaakpay.com/api/callback",
            shipToAddress: data.shipToAddress || "",
            shipToCity: data.shipToCity || "",
            shipToCountry: data.shipToCountry || "",
            shipToFirstname: data.shipToFirstname || "",
            shipToLastname: data.shipToLastname || "",
            shipToPhoneNumber: data.shipToPhoneNumber || "",
            shipToPincode: data.shipToPincode || "",
            shipToState: data.shipToState || "",
            showMobile: "false",
            txnDate: new Date().toISOString().split("T")[0], // yyyy-mm-dd
            txnType: "1",
            paymentOptionTypes: data.paymentOptionTypes || "11_12_13_14",
            zpPayOption: "1"
        };

        // ✅ Step 1: Alphabetically sort keys
        const sortedKeys = Object.keys(params).sort();

        // ✅ Step 2: Create param string key=value&key=value
        const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join("&");

        // ✅ Step 3: Generate HMAC SHA256 checksum
        const checksum = crypto
            .createHmac("sha256", secretKey)
            .update(paramString, "utf-8")
            .digest("hex");

        // ✅ Step 4: Add checksum in params
        params.checksum = checksum;

        // ✅ Step 5: Build payment URL
        const queryString = qs.stringify(params);
        const paymentUrl = `${apiUrl}?${queryString}`;

        // Debug
        console.log("🔹 Param String:", paramString);
        console.log("🔹 Generated Checksum:", checksum);
        console.log("🔹 Final URL:", paymentUrl);

        return res.status(200).json({
            status: "success",
            message: "Zaakpay payment URL generated successfully.",
            payment_url: paymentUrl,
            params
        });

    } catch (error) {
        console.error("❌ Zaakpay Payin Error:", error.message);
        return res.status(500).json({
            status: "failed",
            message: `Zaakpay integration failed: ${error.message}`,
        });
    }
};

export const zaakpayCallback = async (req, res) => {
    try {
        const secretKey = "0678056d96914a8583fb518caf42828a";

        // Zaakpay callback me query/body dono aa sakte hain
        const responseParams = { ...req.body, ...req.query };

        console.log("🔹 Zaakpay Callback Response:", responseParams);

        // ✅ Extract checksum from response
        const receivedChecksum = responseParams.checksum;
        delete responseParams.checksum;

        // ✅ Step 1: Alphabetically sort keys
        const sortedKeys = Object.keys(responseParams).sort();

        // ✅ Step 2: Create string key=value&key=value
        const paramString = sortedKeys
            .map((key) => `${key}=${responseParams[key]}`)
            .join("&");

        // ✅ Step 3: Generate checksum with secretKey
        const calculatedChecksum = crypto
            .createHmac("sha256", secretKey)
            .update(paramString, "utf-8")
            .digest("hex");

        console.log("🔹 Received Checksum:", receivedChecksum);
        console.log("🔹 Calculated Checksum:", calculatedChecksum);

        // ✅ Step 4: Verify checksum
        if (receivedChecksum !== calculatedChecksum) {
            console.error("❌ Invalid checksum. Possible tampering!");
            return res.status(400).json({
                status: "failed",
                message: "Checksum mismatch. Invalid response.",
            });
        }

        // ✅ Step 5: Handle payment status
        if (responseParams.responseCode === "100") {
            // Payment successful
            console.log("✅ Payment Success:", responseParams);

            // DB me transaction update karna ho to karo
            // await VirtualAccountTransaction.create({ ...responseParams });

            return res.status(200).json({
                status: "success",
                message: "Payment successful",
                data: responseParams,
            });
        } else {
            // Payment failed
            console.log("❌ Payment Failed:", responseParams);

            return res.status(200).json({
                status: "failed",
                message: "Payment failed",
                data: responseParams,
            });
        }
    } catch (error) {
        console.error("❌ Zaakpay Callback Error:", error.message);
        return res.status(500).json({
            status: "failed",
            message: `Callback processing error: ${error.message}`,
        });
    }
};

// ✅ Correct HMAC-SHA256 checksum generator
function generateZaakpayChecksum(params, secretKey) {
    // Alphabetically sort params
    const sortedKeys = Object.keys(params).sort();

    // Create string key=value&key=value...
    const paramString = sortedKeys
        .map((key) => `${key}=${params[key]}`)
        .join("&");

    // Generate HMAC SHA256
    const checksum = crypto
        .createHmac("sha256", secretKey)
        .update(paramString, "utf-8")
        .digest("hex");

    console.log("🔹 Checksum String: ", paramString);
    console.log("🔹 Generated HMAC Checksum: ", checksum);

    return checksum;
}

// import crypto from "crypto";
// import qs from "querystring";
// import VirtualAccountTransaction from "../models/VirtualAccountTransaction.js"; // adjust path as needed

// export const zaakpayPayin = async (req, res) => {
//     try {
//         const data = req.body;
//         const user = req.user; // assume user info is attached via auth middleware

//         // ✅ Zaakpay credentials
//         // const merchantId = "236e6378d80e492f95283a119417ef01";
//         // const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
//         //old below
//         const merchantId = "b19e8f103bce406cbd3476431b6b7973";
//         const secretKey = "0678056d96914a8583fb518caf42828a";
//         const apiUrl = "https://zaakstaging.zaakpay.com";

//         // ✅ Prepare order and amount (Zaakpay accepts amount in paisa)
//         const orderId = "ZAAK" + Date.now();
//         const amountInPaisa = parseInt(data.amount * 100);

//         // ✅ Return URL (Zaakpay will redirect here after payment)
//         const returnUrl = "https://www.google.com";

//         // ✅ Prepare parameters
//         const params = {
//             merchantIdentifier: merchantId,
//             orderId: orderId,
//             amount: amountInPaisa,
//             currency: "INR",
//             buyerEmail: data.email,
//             buyerFirstName: data.name,
//             buyerLastName: "User",
//             buyerAddress: "India",
//             buyerCity: "Delhi",
//             buyerState: "Delhi",
//             buyerCountry: "IND",
//             buyerPincode: "110001",
//             buyerPhoneNumber: data.mobile,
//             returnUrl: returnUrl,
//             productDescription: "Zaakpay Payment",
//         };

//         // ✅ Generate checksum
//         const checksum = generateZaakpayChecksum(params, secretKey);
//         params.checksum = checksum;

//         // ✅ Save transaction before redirect
//         const txn = new VirtualAccountTransaction({
//             customerId: user?._id || null,   // ✅ Safe access
//             transactionNo: data.reference,
//             amount: data.amount,
//             name: data.name,
//             mobile: data.mobile,
//             email: data.email,
//             apiTransactionNo: orderId,
//             status: "pending",
//             apiPartner: "zaakpay",
//         });

//         await txn.save();

//         // ✅ Build redirect URL
//         const queryString = qs.stringify(params);
//         const paymentUrl = `${apiUrl}?${queryString}`;

//         // ✅ Return success response
//         return res.status(200).json({
//             status: "success",
//             message: "Zaakpay Payment URL generated successfully.",
//             payment_url: paymentUrl,
//         });
//     } catch (error) {
//         console.error("Zaakpay Payin Error:", error.message);
//         return res.status(500).json({
//             status: "failed",
//             data: null,
//             message: `Zaakpay integration failed: ${error.message}`,
//         });
//     }
// };



// function generateZaakpayChecksum(params, secretKey) {
//     // 1. Alphabetically sort params
//     const sortedKeys = Object.keys(params).sort();

//     // 2. Create string "key=value&key=value..."
//     const paramString = sortedKeys
//         .map((key) => `${key}=${params[key]}`)
//         .join("&");

//     // 3. Add secret key at end
//     const finalString = paramString + secretKey;

//     // 4. Generate SHA256 checksum
//     const checksum = crypto
//         .createHash("sha256")
//         .update(finalString, "utf-8")
//         .digest("hex");

//     // Debug logs
//     console.log("🔹 Sorted Params String: ", paramString);
//     console.log("🔹 Final String (with Secret): ", finalString);
//     console.log("🔹 Generated Checksum: ", checksum);

//     return checksum;
// }

// // Example usage:
// const params = {
//     merchantIdentifier: "236e6378d80e492f95283a119417ef01",
//     orderId: "ZAAK1759900922429",
//     amount: "10000",
//     currency: "INR",
//     buyerEmail: "test@example.com",
//     buyerFirstName: "Rahul",
//     buyerLastName: "Singh",
//     buyerAddress: "India",
//     buyerCity: "Delhi",
//     buyerState: "Delhi",
//     buyerCountry: "IND",
//     buyerPincode: "110001",
//     buyerPhoneNumber: "9876543210",
//     returnUrl: "https://www.google.com",
//     productDescription: "Zaakpay Payment",
// };

// // const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
// // old below
// const secretKey = "0678056d96914a8583fb518caf42828a";

// generateZaakpayChecksum(params, secretKey);
