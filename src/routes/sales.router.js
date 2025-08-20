import express from "express";
import { getSalesOverview } from "../controller/sales.controller.js";




const salesRouter = express.Router();

salesRouter.get("/", getSalesOverview);

export default salesRouter;
