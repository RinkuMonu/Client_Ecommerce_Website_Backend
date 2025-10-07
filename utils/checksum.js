import crypto from "crypto";
import { merchantInfo } from "../config.js";

const secretkey = merchantInfo.secretKey;

const getChecksumString = (data) => {
  const checksumsequence = [
    "amount", "bankid", "buyerAddress", "buyerCity", "buyerCountry", "buyerEmail",
    "buyerFirstName", "buyerLastName", "buyerPhoneNumber", "buyerPincode", "buyerState",
    "currency", "debitorcredit", "merchantIdentifier", "merchantIpAddress", "mode", "orderId",
    "product1Description", "product2Description", "product3Description", "product4Description",
    "productDescription", "productInfo", "purpose", "returnUrl", "shipToAddress", "shipToCity",
    "shipToCountry", "shipToFirstname", "shipToLastname", "shipToPhoneNumber", "shipToPincode",
    "shipToState", "showMobile", "txnDate", "txnType", "zpPayOption"
  ];

  let checksumstring = "";
  for (let key of checksumsequence) {
    if (data[key] && data[key].toString() !== "") {
      checksumstring += `${key}=${data[key]}&`;
    }
  }
  return checksumstring;
};


const getResponseChecksumString = (data) => {
  const checksumsequence = [
    "amount", "bank", "bankid", "cardId", "cardScheme", "cardToken", "cardhashid",
    "doRedirect", "orderId", "paymentMethod", "paymentMode", "responseCode",
    "responseDescription", "productDescription", "product1Description", "product2Description",
    "product3Description", "product4Description", "pgTransId", "pgTransTime"
  ];

  let checksumstring = "";
  for (let key of checksumsequence) {
    if (data[key]) {
      checksumstring += `${key}=${data[key]}&`;
    }
  }
  return checksumstring;
};

const calculateChecksum = (checksumstring) => {
  const hmac = crypto.createHmac("sha256", secretkey);
  hmac.update(checksumstring);
  return hmac.digest("hex");
};

export default { getChecksumString, getResponseChecksumString, calculateChecksum };
