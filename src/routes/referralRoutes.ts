import { referralController } from "./../controllers/referralController"
import express from "express"
const router = express.Router()

router.get("/", referralController)

export default router
