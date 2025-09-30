import crypto from "crypto";

/**
 * Generate checksum for Zaakpay
 * @param {string} jsonString - JSON string of payload
 * @param {string} secretKey - Merchant secret key
 */
export const generateChecksum = (jsonString, secretKey) => {
  return crypto.createHmac("sha256", secretKey).update(jsonString).digest("hex");
};

/**
 * Verify checksum received from Zaakpay
 * @param {string} jsonString - JSON string of payload
 * @param {string} receivedChecksum - Checksum received from Zaakpay
 * @param {string} secretKey - Merchant secret key
 */
export const verifyChecksum = (jsonString, receivedChecksum, secretKey) => {
  const calculated = crypto.createHmac("sha256", secretKey).update(jsonString).digest("hex");
  return calculated === receivedChecksum;
};
