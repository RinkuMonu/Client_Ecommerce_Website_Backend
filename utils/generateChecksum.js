import crypto from "crypto";

export const generateChecksum = (dataString, secretKey) => {
  return crypto.createHmac("sha256", secretKey).update(dataString).digest("hex");
};