
import express from "express";
import { generatePayment, zaakpayCallback } from "../controller/zaakpayController.js";

const router = express.Router();

// ✅ POST /api/zaakpay/payin
router.post("/generatePayment", generatePayment);
router.post("/callback", zaakpayCallback);
export default router;
