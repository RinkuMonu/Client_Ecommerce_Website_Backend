// import express from "express";
// import { zaakpayPayin } from "../controller/zaakpayController.js";

// const router = express.Router();

// // POST: /api/payment/payin
// router.post("/paymentTransact/V8", zaakpayPayin);
// // router.post("/callback", zaakpayCallback);

// export default router;

import express from "express";
import { initiateZaakpayPayment, zaakpayCallback } from "../controller/zaakpayController.js";

const router = express.Router();

// ✅ POST /api/zaakpay/payin
router.post("/payin", initiateZaakpayPayment);
router.post("/callback", zaakpayCallback);
export default router;
