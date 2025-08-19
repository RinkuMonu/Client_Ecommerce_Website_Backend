
import { validationResult } from "express-validator";
import Coupon from "../models/Coupon.model.js";

// Create a new coupon
export const createCoupon = async (req, res) => {

    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const couponData = req.body;
        couponData.referenceWebsite = req.user.referenceWebsite;

        const coupon = new Coupon(couponData);
        await coupon.save();

        res.status(201).json({
            success: true,
            message: "Coupon code created successfully"
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all coupons
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({
            referenceWebsite: req.user.referenceWebsite,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: coupons,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get single coupon
export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({
            _id: req.params.id,
            referenceWebsite: req.user.referenceWebsite,
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        res.status(200).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update coupon
export const updateCoupon = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (req.body.startDate && req.body.endDate) {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);

            if (endDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: "End date must be after start date",
                });
            }
        }
        const coupon = await Coupon.findOneAndUpdate(
            {
                _id: req.params.id,
                referenceWebsite: req.user.referenceWebsite,
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: coupon,
        });
    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists",
            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOneAndDelete({
            _id: req.params.id,
            referenceWebsite: req.user.referenceWebsite,
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Validate coupon
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const now = new Date();

        const coupon = await Coupon.findOne({
            code,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            referenceWebsite: req.user.referenceWebsite,
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired coupon",
            });
        }

        // Check if coupon has usage limit
        if (coupon.usageLimit) {
            // Example: implement usage tracking
            // const usageCount = await getCouponUsageCount(coupon._id);
            // if (usageCount >= coupon.usageLimit) {
            //   return res.status(400).json({
            //     success: false,
            //     message: 'Coupon usage limit reached'
            //   });
            // }
        }

        res.status(200).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


