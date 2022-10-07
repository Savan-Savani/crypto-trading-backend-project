import {
  addCoinpieController,
  deleteCoinpiesController,
  getCoinController,
  getCoinpiesController,
  getUserCoinpiesController,
  updateCoinpiesController,
} from "./../controllers/coinpiesController"
import express from "express"
const router = express.Router()

router.get("/", getCoinpiesController)
router.post("/", addCoinpieController)
router.patch("/:id", updateCoinpiesController)
router.delete("/:id", deleteCoinpiesController)
router.get("/:id", getUserCoinpiesController)
router.get("/getCoin/list", getCoinController)

export default router
