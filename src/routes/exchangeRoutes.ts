import { pairs_listController } from "./../controllers/exchangeController"
import express from "express"

const router = express.Router()

router.get("/pairs-list", pairs_listController)

export default router
