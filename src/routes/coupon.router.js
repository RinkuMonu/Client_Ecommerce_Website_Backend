import express from "express";

import { check } from "express-validator";
import { createCoupon, deleteCoupon, getAllCoupons, getCoupon, updateCoupon, validateCoupon } from "../controller/Coupon.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";



const couponRoutes = express.Router();

// Validation rules
const couponValidationRules = [
    check("code").notEmpty().withMessage("Coupon code is required"),
    check("discountType")
        .isIn(["percentage", "fixed"])
        .withMessage("Invalid discount type"),
    check("discountValue")
        .isFloat({ min: 0 })
        .withMessage("Discount value must be a positive number"),
    check("minOrderAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Minimum order amount must be positive"),
    check("maxDiscountAmount")
        .optional()
        .isFloat({ min: 0 })
        .custom((value, { req }) => {
            if (req.body.discountType === "percentage" && !value) {
                throw new Error(
                    "Maximum discount amount is required for percentage discounts"
                );
            }
            return true;
        }),
    check("startDate").isISO8601().withMessage("Invalid start date"),
    check("endDate").isISO8601().withMessage("Invalid end date"),
    check("usageLimit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Usage limit must be at least 1"),
    check("applicableProducts")
        .optional()
        .isIn(["all", "specific", "category"]),
    check("productIds").optional().isArray(),
];



// Coupon routes
couponRoutes.post("/", couponValidationRules, isAdmin, createCoupon);
couponRoutes.get("/", isAdmin, getAllCoupons);
couponRoutes.get("/:id", isAdmin, getCoupon);
couponRoutes.put("/:id", couponValidationRules, isAdmin, updateCoupon);
couponRoutes.delete("/:id", isAdmin, deleteCoupon);

// Validate coupon
couponRoutes.post(
    "/validate",
    [check("code").notEmpty().withMessage("Coupon code is required")],
    isAdmin, validateCoupon
);

export default couponRoutes;
