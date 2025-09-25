import CouponModel from "../models/Coupon.model.js";

// ✅ Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      expiryDate,
      applicableTo,
      startDate,
      minimumOrderValue,
      applicableProducts,
      applicableUsers,
      usageLimit,
    } = req.body;

    const coupon = new CouponModel({
      code,
      discountType, // "percentage" | "fixed"
      discountValue,
      expiryDate,
      applicableTo, // "product" | "user"
      applicableProducts,
      startDate,
      minimumOrderValue,
      applicableUsers,
      usageLimit,
    });

    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Apply Coupon

// export const applyCoupon = async (req, res) => {
//   try {
//     const { code, userId, productId } = req.body;

//     const coupon = await CouponModel.findOne({ code });
//     if (!coupon) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Invalid coupon" });
//     }

//     // Check expiry
//     if (new Date() > new Date(coupon.expiryDate)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Coupon expired" });
//     }

//     // Check usage limit
//     if (coupon.usageLimit <= coupon.usageCount) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Coupon usage limit reached" });
//     }

//     // Apply condition based on applicableTo
//     // if (coupon.applicableTo === "user") {
//     //     if (!coupon.applicableUsers.includes(userId)) {
//     //         return res.status(400).json({ success: false, message: "Coupon not valid for this user" });
//     //     }
//     // }

//     const alreadyApplied = coupon.userUsage.some(
//       (u) => u._id === userId && u.state === "applied"
//     );
//     if (alreadyApplied) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Coupon already applied but not used",
//         });
//     }

//     if (!coupon.applicableProducts.includes(productId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Coupon not valid for this product" });
//     }

//     // ✅ Increase usage count
//     coupon.totalUsed += 1;
//     coupon.userUsage.push({ userId, state: "applied" });
//     await CouponModel.save();

//     // Apply discount (example: calculate new price)
//     let discountInfo = {};
//     if (coupon.discountType === "percentage") {
//       discountInfo = {
//         type: "percentage",
//         value: coupon.discountValue,
//         message: `${coupon.discountValue}% discount applied!`,
//       };
//     } else {
//       discountInfo = {
//         type: "fixed",
//         value: coupon.discountValue,
//         message: `${coupon.discountValue}₹ discount applied!`,
//       };
//     }

//     res.json({
//       success: true,
//       message: "Coupon applied successfully",
//       discount: discountInfo,
//     });
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({ success: false, message: err.message });
//   }
// };
export const applyCoupon = async (req, res) => {
  try {
    const { code, userId, productId, subtotal } = req.body;

    const coupon = await CouponModel.findOne({ code });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon" });
    }

    // Active check
    if (!coupon.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon is inactive" });
    }

    // Date checks
    const now = new Date();
    if (now < coupon.startDate) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon is not yet valid" });
    }
    if (now > coupon.expiryDate) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon expired" });
    }

    // Usage limit check
    if (coupon.totalUsed >= coupon.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon usage limit reached" });
    }

    // Per user usage check
    const userAppliedCount = coupon.userUsage.filter(
      (u) => u.user.toString() === userId
    ).length;

    if (userAppliedCount >= coupon.perUserLimit) {
      return res
        .status(400)
        .json({ success: false, message: "You have already used this coupon" });
    }

    // Product restriction check
    if (
      coupon.applicableProducts.length > 0 &&
      !coupon.applicableProducts.some((p) => p.toString() === productId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon not valid for this product" });
    }

    // User restriction check
    if (
      coupon.applicableUsers.length > 0 &&
      !coupon.applicableUsers.some((u) => u.toString() === userId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon not valid for this user" });
    }

    // Minimum order value check
    if (subtotal < coupon.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value should be ₹${coupon.minimumOrderValue} to use this coupon`,
      });
    }

    // ✅ Update usage
    coupon.totalUsed += 1;
    coupon.userUsage.push({ user: userId, state: "applied" });
    await coupon.save();

    // ✅ Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: "Coupon applied successfully",
      discount: {
        type: coupon.discountType,
        value: coupon.discountValue,
        amount: discountAmount,
      },
      finalPrice: subtotal - discountAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get All Coupons for admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await CouponModel.find();
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ✅ Get All Coupons for user

export const getValidCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await CouponModel.find({
      isActive: true, // sirf active coupons
      startDate: { $lte: now }, // already started
      expiryDate: { $gte: now }, // abhi expire nahi hua
      $expr: { $lt: ["$totalUsed", "$usageLimit"] }, // usage limit exceed na ho
    });

    res.json({
      success: true,
      message: "Valid coupons fetched",
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch valid coupons",
      error: error.message,
    });
  }
};

// ✅ Get Single Coupon
export const getCouponById = async (req, res) => {
  try {
    const coupon = await CouponModel.findById(req.params.id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await CouponModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await CouponModel.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//
