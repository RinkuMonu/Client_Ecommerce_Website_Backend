import express from "express";
import checksum from "../../utils/checksum.js";
import response from "../../utils/response.js";
import transacturl from "../../config.js";
import { merchantInfo } from "../../config.js";
import axios from "axios";

const router = express.Router();

router.post("/transact", async (req, res) => {
    const data = {
        amount: "200", // paisa me
        currency: "INR",
        merchantIdentifier: merchantInfo.merchantId,
        orderId: `ORID${Date.now()}`,
        returnUrl: "https://jajamblockprints.com/api/status",
        productDescription: "Book Purchase",

        // 🔹 Extra Required Fields
        mode: "0",               // skip domain check (testing)
        zpPayOption: "1",        // redirect checkout
        txnDate: new Date().toISOString().slice(0, 10),

        buyerFirstName: "Waleed",
        buyerLastName: "Shaikh",
        buyerEmail: "codesense24@gmail.com",
        buyerPhoneNumber: "9876543210",
        buyerAddress: "MG Road",
        buyerCity: "Delhi",
        buyerState: "Delhi",
        buyerCountry: "IND",
        buyerPincode: "110001",
        purpose: "0", // service
        txnType: "1", // all payment methods
        merchantIpAddress: "127.0.0.1"
    };


    const checksumstring = checksum.getChecksumString(data);
    const calculatedchecksum = checksum.calculateChecksum(checksumstring);

    const url = transacturl.merchantInfo.transactApi;

    return res.status(200).send({
        url,
        checksum: calculatedchecksum,
        data,
    });
});

router.post("/status", async (req, res) => {
    try {
        console.log(req.body);
          const checksumstring = checksum.getResponseChecksumString(req.body);
        const calculated = checksum.calculateChecksum(checksumstring);

        if (calculated !== req.body.checksum) {
            console.error("⚠️ Checksum mismatch! Possible tampering.");
            return res.status(400).send("Checksum mismatch");
        }
        console.log("Message: " + response.getResponseCodes(req.body.responseCode));

        if (req.body.responseCode == 100) {
            res.redirect(
                `https://jajamblockprints.com/checkout/success?id=${req.body.orderId}&checksum=${req.body.checksum}`
            );
        } else {
            res.redirect(
                `https://jajamblockprints.com/checkout/failure?id=${req.body.orderId}&checksum=${req.body.checksum}`
            );
        }

    } catch (error) {
        console.log(error);
    }
});

export default router;
