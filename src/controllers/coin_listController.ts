import { Request, Response } from "express"
import CoinGecko from "coingecko-api"
import _ from "lodash"
const CoinGeckoClient: any = new CoinGecko()

export const coin_listController = async (req: Request, res: Response) => {
  try {
    let { category, offset, search } = req.body
    let limit = req.body.limit || 5
    let dataArray: any = []
    let graphData: any
    let data = await CoinGeckoClient.coins.markets({ per_page: limit })

    let newData = JSON.parse(JSON.stringify(data.data))
    await Promise.all(
      await newData.map(async (key: any, i: number) => {
        graphData = await coinGraph(key.id)
        await dataArray.push({
          id: key.id,
          title: key.symbol.toUpperCase(),
          image: key.image,
          latestPrice: key.current_price,
          changes: {
            oneDay: key.price_change_percentage_24h,
          },
          marketCap: key.market_cap,
          values: {
            oneDay: key.market_cap_change_24h,
          },

          priceGraph: {
            isPositive: key.price_change_percentage_24h > 0 ? true : false,
            timestamps: graphData.timestamps,
            prices: graphData.prices,
          },
        })
      })
    )
      .then(() => {
        res.send({
          currency: "$",
          currencyName: "USD",
          totalPages: dataArray.length,
          tableBodyData: dataArray,
        })
      })
      .catch((err: Error) => {
        res.status(401).send({
          error_message: err.message,
        })
      })
  } catch (error: any) {
    res.status(400).send({ error_message: error.message })
  }
}

//graph for particular coin
const coinGraph = async (coin: any) => {
  let timestamps: any = []
  let prices: any = []

  let data: any = await CoinGeckoClient.coins.fetchMarketChart(coin, {
    days: 1,
  })

  let coinArray = JSON.parse(JSON.stringify(data.data.prices))

  for (let i = 0; i < coinArray.length; i++) {
    timestamps.push(coinArray[i][0])
    prices.push(coinArray[i][1])
  }
  return { timestamps: timestamps, prices: prices }
}
