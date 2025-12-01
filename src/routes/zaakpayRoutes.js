import express from "express";
import { zaakpayPayin, zaakpayCallback, getPaymentHistory } from "../controller/zaakpayController.js"; // ✅ must include .js extension
import { authUser } from "../middleware/authUser.js";
const router = express.Router();

// ✅ Initiate payment (PayIn)
// router.post("/payin", zaakpayPayin);
router.post("/payin", authUser ,zaakpayPayin);

// ✅ Handle Zaakpay callback (Post payment response)
router.post("/callback", zaakpayCallback);

router.get("/history", authUser, getPaymentHistory);


export default router;
