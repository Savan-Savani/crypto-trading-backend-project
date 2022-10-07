import express from "express"
import {
  constituentsIDController,
  customizeIDController,
  performance_graphIDController,
  pieSetsController,
  pieSetsIDController,
  returnsIDController,
} from "../controllers/pieSetsController"
const router = express.Router()

router.get("/", pieSetsController)
router.get("/:id", pieSetsIDController)
router.get("/constituents/:id", constituentsIDController)
router.get("/performance-graph/:id", performance_graphIDController)
router.get("/returns/:id", returnsIDController)
router.get("/customize/:id", customizeIDController)

export default router
