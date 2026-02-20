import express from "express";
import {
    getFeaturedAds,
    updateFeaturedAdStatus,
    deleteFeaturedAd
} from "../controllers/featured.controller.js";

const router = express.Router();

router.get("/all", getFeaturedAds);
router.put("/:id/status", updateFeaturedAdStatus);
router.delete("/:id", deleteFeaturedAd);

export default router;
