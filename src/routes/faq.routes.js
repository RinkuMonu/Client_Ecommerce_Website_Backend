import express from "express";
import {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} from "../controller/faq.controller.js";

const router = express.Router();

// CRUD routes
router.post("/create", createFAQ);     
router.get("/all", getAllFAQs);       // Get all FAQs
router.get("/:id", getFAQById);       // Get single FAQ
router.put("/:id", updateFAQ);        // Update FAQ
router.delete("/:id", deleteFAQ);     // Delete FAQ

export default router;
