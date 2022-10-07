import { Request, Response } from "express"
import axios from "axios"
import _ from "lodash"

export const pairs_listController = async (req: Request, res: Response) => {
  let pairWith = req.body.pairWith || "USDT"
  try {
    await axios
      .get("https://ftx.com/api/markets")
      .then(async (re) => {
        let filterData = await re.data.result.filter(
          (key: any) => key.quoteCurrency === pairWith
        )
        const strcture = _(filterData)
          .groupBy("name")
          .map((group, name) => ({
            id: name.replace("/", "_"),
            tradingPair: name.split("/"),
            price: {
              value: group[0].price,
              isPositive: group[0].change24 > 0 ? true : false,
            },
            values: {
              oneDay: group[0].change24h.toFixed(5),
            },
          }))
        res.status(200).send({ tableBodyData: strcture })
      })
      .catch((error: Error) =>
        res.status(400).send({ error_message: error.message })
      )
  } catch (error: any) {
    res.status(400).send({ error_message: error.message })
  }
}
