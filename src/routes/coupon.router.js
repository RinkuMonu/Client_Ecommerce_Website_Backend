import express from "express";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
} from "../controller/Coupon.controller.js";

const coupon = express.Router();

// ✅ Create new coupon
coupon.post("/", createCoupon);

// ✅ Apply coupon (user/product ke base pe validate hoga)
coupon.post("/apply", applyCoupon);

// ✅ Get all coupons
coupon.get("/", getCoupons);

// ✅ Get single coupon
coupon.get("/:id", getCouponById);

// ✅ Update coupon
coupon.put("/:id", updateCoupon);

// ✅ Delete coupon
coupon.delete("/:id", deleteCoupon);

export default coupon;
