import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    referenceWebsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Websitelist",
      // required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive value"],
    },
    actualPrice: {
      type: Number,
      min: [0, "Price must be a positive value"],
      default: 0,
    },
    material: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Boolean,
      default: false,
    },
    size: [
      {
        sizes: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          min: [0, "Price must be a positive value"],
        },
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);
productSchema.index({
  productName: "text",
  description: "text",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
