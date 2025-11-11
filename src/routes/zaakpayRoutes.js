
import express from "express";
import { zaakpayPayin, zaakpayCallback } from "../controller/zaakpayController.js";

const router = express.Router();

// ✅ POST /api/zaakpay/payin
router.post("/payin", zaakpayPayin);
router.post("/callback", zaakpayCallback);
export default router;
