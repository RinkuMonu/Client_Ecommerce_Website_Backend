import express from "express";
import {
  createMultipleProducts,
  createProduct,
  deleteProduct,
  getProductDetail,
  getProducts,
  searchProducts,
  updateProduct,
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

productRoutes.delete("/delete/:id", isAdmin, deleteProduct);
productRoutes.put(
  "/products/:id",
  upload.array("images", 5),
  isAdmin,
  updateProduct
);
productRoutes.post("/addmany", createMultipleProducts);

export default productRoutes;
