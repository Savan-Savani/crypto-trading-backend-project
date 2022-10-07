import { Request, Response } from "express"
import { User } from "./../models/userModel"
import { ValidToken } from "./../config/commonFunction"
import { UserPie } from "../models/userPieModel"
import { TransactionHistory } from "../models/transactionHistoryModel"

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      User.findOneAndDelete({ email: Object(tokenData.data.email) })
        .then(async (result: any) => {
          if (result) {
            await UserPie.deleteMany({
              buyerId: Object(tokenData.data.id),
            })
            await TransactionHistory.deleteMany({
              userId: tokenData.data.id,
            })
            res.status(202).send({ message: "Account deleted successfully" })
          } else {
            res.status(404).send({ error_message: "user not available" })
          }
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(400).send({ error_message: error.message })
  }
}
