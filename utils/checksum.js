import { config } from "../config.js";

if (!config.merchantId) {
  console.error("❌ ZAAKPAY_MERCHANT_ID missing");
}
import crypto from "crypto";

// const secretKey = "8bc8c997888f42cea0e2e82b958de393";

const secretKey = process.env.ZAAKPAY_SECRET_KEY;

export const generateChecksum = (params, secretKey) => {
  const keys = [
    "merchantIdentifier",
    "orderId",
    "returnUrl",
    "buyerEmail",
    "buyerFirstName",
    "buyerLastName",
    "buyerAddress",
    "buyerCity",
    "buyerState",
    "buyerCountry",
    "buyerPincode",
    "buyerPhoneNumber",
    "txnType",
    "zpPayOption",
    "mode",
    "currency",
    "amount",
    "merchantIpAddress",
    "txnDate",
    "productDescription",
    "purpose",
  ];

  let data = "";
  keys.forEach((k) => {
    if (params[k] !== undefined && params[k] !== null) {
      data += `'${params[k]}'`;
    } else {
      data += "''"; // empty value bhi include karo
    }
  });

  console.log("🔑 Checksum String =>", data); // 👈 yahan log aayega

  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
};

export const verifyChecksum = (params, receivedChecksum) => {
  const keys = [
    "merchantIdentifier",
    "orderId",
    "responseCode",
    "responseDescription",
    "txnId",
    "amount",
    "txnDate"
  ];

  let data = "";
  keys.forEach((k) => {
    if (params[k]) data += `'${params[k]}'`;
  });

  const calculatedChecksum = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex");

  return calculatedChecksum === receivedChecksum;
};
