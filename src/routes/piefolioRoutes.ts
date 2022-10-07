import {
  addFunds_king_pieController,
  bookProfitController,
  customize_king_pieController,
  my_piesController,
  overall_statsController,
  sellFunds_king_pieController,
} from "./../controllers/piefolioController"
import express from "express"
const router = express.Router()

router.get("/overall-stats", overall_statsController)
router.get("/my-pies", my_piesController)
router.get("/king-pie/customize", customize_king_pieController)
router.post("/king-pie/add-funds", addFunds_king_pieController)
router.post("/king-pie/sell-funds", sellFunds_king_pieController)
router.post("/book-profit", bookProfitController)

export default router
