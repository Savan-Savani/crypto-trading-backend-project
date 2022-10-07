import express from "express"
import {
  addFundsController,
  buyPiesController,
  getUserPiesController,
  getOnePieController,
  sellPieController,
  sellCoinFromPieController,
  historyController,
  replaceCoinController,
  bookProfitPieController,
  bookProfitCoinController,
  withdrawFundsController,
  cancelBookProfitController,
  cancelCoinBookProfitController,
  cheakAutoBookProfitController,
  uniqeCoinListController,
  buyCoinController,
  sellCoinController,
} from "../controllers/transactoinController"
const router = express.Router()

router.post("/addFunds", addFundsController)
router.post("/buyPies", buyPiesController)
router.get("/getUserPies", getUserPiesController)
router.get("/getOnePie/:pieId", getOnePieController)
router.post("/sellPie", sellPieController)
router.post("/sellCoinFromPie", sellCoinFromPieController)
router.get("/history", historyController)
router.post("/replaceCoin", replaceCoinController)
router.post("/bookProfitPie", bookProfitPieController)
router.post("/bookProfitCoin", bookProfitCoinController)
router.post("/withdrawFunds", withdrawFundsController)
router.post("/cancelBookProfit", cancelBookProfitController)
router.post("/cancelCoinBookProfit", cancelCoinBookProfitController)
router.post("/cheakAutoBookProfit", cheakAutoBookProfitController)
router.get("/uniqeCoinList", uniqeCoinListController)

router.post("/buyCoin", buyCoinController)
router.post("/sellCoin", sellCoinController)

export default router
