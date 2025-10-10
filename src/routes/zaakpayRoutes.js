import express from "express";
import { zaakpayPayin, zaakpayCallback } from "../controller/zaakpayController.js";

const router = express.Router();

// POST: /api/payment/payin
router.post("/paymentTransact/V8", zaakpayPayin);
router.post("/callback", zaakpayCallback);

export default router;