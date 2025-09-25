import express from "express";
import { initiatePayment, paymentCallback } from "../controller/paymentController.js";

const router = express.Router();

// initiate payment
// router.post("/initiate", initiatePayment);
router.get("/initiate", initiatePayment);
// callback from Zaakpay
router.post("/callback", paymentCallback);

export default router;
