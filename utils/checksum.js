import crypto from "crypto";
import { merchantInfo } from "../config.js";

const secretkey = merchantInfo.secretKey;

// Request checksum
const getChecksumString = (data) => {
    const checksumsequence = [
        "amount", "buyerAddress", "buyerCity", "buyerCountry", "buyerEmail",
        "buyerFirstName", "buyerLastName", "buyerPhoneNumber", "buyerPincode", "buyerState",
        "currency", "merchantIdentifier", "merchantIpAddress", "mode", "orderId",
        "productDescription", "txnDate", "txnType", "zpPayOption", "purpose"
    ];

    let checksumstring = "";
    for (let key of checksumsequence) {
        if (data[key] && data[key].toString() !== "") {
            checksumstring += `${key}=${data[key]}&`;
        }
    }
    return checksumstring;
};

// Response checksum
const getResponseChecksumString = (data) => {
    const checksumsequence = [
        "amount", "bank", "bankid", "cardId", "cardScheme", "cardToken", "cardhashid",
        "doRedirect", "orderId", "paymentMethod", "paymentMode", "responseCode",
        "responseDescription", "productDescription", "product1Description", "product2Description",
        "product3Description", "product4Description", "pgTransId", "pgTransTime"
    ];

    let checksumstring = "";
    for (let key of checksumsequence) {
        if (data[key] && data[key].toString() !== "") {
            checksumstring += `${key}=${data[key]}&`;
        }
    }
    return checksumstring;
};

const calculateChecksum = (checksumstring) => {
    return crypto.createHmac("sha256", secretkey).update(checksumstring).digest("hex");
};

export default { getChecksumString, getResponseChecksumString, calculateChecksum };
