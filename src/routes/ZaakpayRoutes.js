import express from "express";
import { initiatePayment, handleCallback } from "../controller/ZaakpayController.js";

const router = express.Router();

router.post("/pay", initiatePayment);
router.post("/callback", handleCallback);

export default router;