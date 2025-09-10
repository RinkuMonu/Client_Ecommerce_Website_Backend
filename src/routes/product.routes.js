import express from "express";
import {
  applyCouponOnProduct,
  createMultipleProducts,
  createProduct,
  deleteProduct,
  getProductDetail,
  getProducts,
  searchProducts,
  updateProduct,
  getTopSellingProducts,
  getTopSellingCategories,
  toggleDealOfTheDayHourly,
  getDealOfTheDayProducts
} from "../controller/Product.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/multerConfig.js";

const productRoutes = express.Router();

productRoutes.post(
  "/products",
  isAdmin,
  upload.array("images", 5),
  createProduct
);

productRoutes.get("/getproducts", getProducts);
productRoutes.get("/getproduct/:id", getProductDetail);
productRoutes.get("/search", searchProducts);
productRoutes.get("/topselling", getTopSellingProducts);
productRoutes.get("/topsales", getTopSellingCategories);
productRoutes.get("/deals", getDealOfTheDayProducts);

productRoutes.delete("/delete/:id", isAdmin, deleteProduct);
productRoutes.put(
  "/products/:id",
  upload.array("images", 5),
  isAdmin,
  updateProduct
);

 productRoutes.put("/deal/:id", toggleDealOfTheDayHourly);

productRoutes.post("/addmany", createMultipleProducts);

// apply-coupon 
productRoutes.put("/apply-coupon/:id", applyCouponOnProduct);

export default productRoutes;
