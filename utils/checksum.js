// utils/checksum.js
import crypto from "crypto";

/**
 * Zaakpay checksum: HMAC-SHA256 over the entire JSON string in `data`.
 * @param {string} jsonString - JSON.stringify(payload)
 * @param {string} secretKey  - Zaakpay Secret Key
 */
export function generateChecksum(jsonString, secretKey) {
  return crypto.createHmac("sha256", secretKey).update(jsonString).digest("hex");
}

/**
 * Verify checksum by recalculating over the same `data` JSON string.
 */
export function verifyChecksum(jsonString, receivedChecksum, secretKey) {
  const calc = generateChecksum(jsonString, secretKey);
  return calc === receivedChecksum;
}
