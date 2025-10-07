// config.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
    merchantId: process.env.ZAAKPAY_MERCHANT_ID,
  secretKey: process.env.ZAAKPAY_SECRET_KEY,
  callbackUrl: process.env.ZAAKPAY_CALLBACK_URL,
  endpoint: process.env.ZAAKPAY_ENDPOINT,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  port: process.env.PORT || 5007,
};
