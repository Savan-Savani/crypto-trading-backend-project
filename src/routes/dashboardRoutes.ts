import express from "express"
const router = express.Router()
import {
  getNewsDashboardController,
  king_pieController,
  recent_activitesController,
  investment_summaryController,
} from "../controllers/dashboardController"

router.get("/news", getNewsDashboardController)
router.get("/king-pie", king_pieController)
router.get("/recent-activities", recent_activitesController)
router.get("/investment-summary", investment_summaryController)

export default router
