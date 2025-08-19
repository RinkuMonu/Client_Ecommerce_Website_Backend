import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed']
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableProducts: {
        type: String,
        enum: ['all', 'specific', 'category'],
        default: 'all'
    },
    productIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    referenceWebsite: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster querying
couponSchema.index({ code: 1, referenceWebsite: 1 }, { unique: true });
couponSchema.index({ referenceWebsite: 1, isActive: 1, startDate: 1, endDate: 1 });

// Pre-save hook to uppercase the code
couponSchema.pre('save', function (next) {
    this.code = this.code.toUpperCase();
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Coupon', couponSchema);