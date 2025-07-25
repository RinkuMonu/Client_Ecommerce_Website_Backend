import express from "express";
import { createMultipleProducts, createProduct, deleteProduct, getProductDetail, getProducts, updateProduct } from "../controller/Product.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/multerConfig.js";

const productRoutes = express.Router();

productRoutes.post(
  "/createproduct",
  isAdmin,
  upload.array("images", 5), // up to 5 images
  createProduct
);

productRoutes.get("/getproducts", getProducts);
productRoutes.get("/getproduct/:id", getProductDetail);

productRoutes.delete("/delete/:id", isAdmin, deleteProduct);
productRoutes.put("/products/:id", isAdmin, updateProduct);
productRoutes.post("/addmany",createMultipleProducts);

export default productRoutes;
