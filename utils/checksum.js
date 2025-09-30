import crypto from "crypto";

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
      data += "''";
    }
  });

  console.log("🔑 Checksum String =>", data);

  return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
};

export const verifyChecksum = (params, receivedChecksum, secretKey) => {
  const keys = [
    "merchantIdentifier",
    "orderId",
    "responseCode",
    "responseDescription",
    "txnId",
    "amount",
    "txnDate",
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