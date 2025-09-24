import express from "express";
import { initiatePayment, paymentCallback } from "../controller/ZaakpayController.js";

const router = express.Router();

router.post("/pay", initiatePayment);
router.post("/callback", paymentCallback);

export default router;