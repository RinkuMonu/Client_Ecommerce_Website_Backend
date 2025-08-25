import express from "express";
import { deleteSubscriber, getSubscribers, subscribeNewsletter, unsubscribeNewsletter } from "../controller/newsletter.Controller.js";

const newsletter = express.Router();

newsletter.post("/subscribe", subscribeNewsletter);
newsletter.post("/unsubscribe", unsubscribeNewsletter);
newsletter.get("/allsubscribers", getSubscribers);
newsletter.delete("/deleteSubscriber/:id", deleteSubscriber);

export default newsletter;
