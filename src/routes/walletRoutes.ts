import express from "express"
import {
  coinWalletAssetsController,
  overallAssetsController,
  usdWalletAssetsController,
} from "../controllers/walletController"
const router = express.Router()

router.get("/overall-assets", overallAssetsController)
router.get("/wallet-assets/usd", usdWalletAssetsController)
router.get("/wallet-assets/coin", coinWalletAssetsController)

export default router
