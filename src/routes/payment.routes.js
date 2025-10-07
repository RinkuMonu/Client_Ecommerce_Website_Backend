// import express from "express";
// import { initiatePayment, paymentCallback } from "../controller/paymentController.js";

// const router = express.Router();

// // Test initiation with static values
// router.get("/initiate", initiatePayment);

// // Callback from Zaakpay (must be POST)
// router.post("/callback", paymentCallback);

// export default router;


import { Router } from "express";
import { initiatePayment, paymentCallback } from "../controller/paymentController.js";

const router = Router();

// Initiate with static payloads; choose mode via ?mode=card|netbanking|upi|wallet
router.post("/initiate", initiatePayment);

// Zaakpay will POST here (x-www-form-urlencoded) with data + checksum
router.post("/callback", paymentCallback);

export default router;