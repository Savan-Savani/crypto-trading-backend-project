import { Request, Response } from "express"
import { User } from "./../models/userModel"
import { ValidToken } from "./../config/commonFunction"

export const referralController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      User.findOne({ email: tokenData.data.email })
        .then((result) => {
          res.status(200).send({
            currency: "$",
            currencyName: "USD",
            senPieWallet: 500,
            prepaidWallet: 100,
            earnings: {
              total: 1000,
              thisMonth: 1000,
              investedReferrals: 100,
            },

            friendsJoined: 200,
            referralLink: `https://senpie.com/signup?referral_code=${result.referData.referralCode}`,
            referralCode: `${result.referData.referralCode}`,
            referralText:
              " Join me and 50,000 other investors on senpie to invest in crypto solutions for long-term returns. Get a free $25 reward straight into your Senpie wallet by activating your account using this link. Limited time offer only",
            invitees: {
              data: [
                { name: "Person 1", amount: 500 },
                { name: "Person 2", amount: 500 },
              ],
            },
          })
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
