import express from "express";
import { zaakpayPayin, zaakpayCallback } from "../controller/zaakpayController.js"; // ✅ must include .js extension

const router = express.Router();

// ✅ Initiate payment (PayIn)
router.post("/payin", zaakpayPayin);

// ✅ Handle Zaakpay callback (Post payment response)
router.post("/callback", zaakpayCallback);

export default router;
