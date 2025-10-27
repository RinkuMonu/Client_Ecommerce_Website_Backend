import crypto from "crypto";

/**
 * Generate Zaakpay checksum
 * @param {Object} params - Key-value object of parameters to send to Zaakpay
 * @param {String} secretKey - Zaakpay secret key
 * @returns {String} - Generated checksum
 */
export const generateZaakpayChecksum = (params, secretKey) => {
    // 1️⃣ Filter out null, undefined, empty values
    const filteredParams = Object.entries(params).filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
    );

    // 2️⃣ Sort params alphabetically by key
    const sortedParams = filteredParams.sort((a, b) => a[0].localeCompare(b[0]));

    // 3️⃣ Create query string
    const queryString = sortedParams.map(([key, value]) => `${key}=${value}`).join("&");

    // 4️⃣ Append secret key
    const checksumString = `${queryString}|${secretKey}`;

    // 5️⃣ Generate HMAC SHA-256 checksum
    const checksum = crypto.createHmac("sha256", secretKey).update(checksumString).digest("hex");

    return checksum;
};
