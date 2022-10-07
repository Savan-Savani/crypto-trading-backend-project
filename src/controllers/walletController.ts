import { UserPie } from "./../models/userPieModel"
import { Request, Response } from "express"
import { ValidToken } from "./../config/commonFunction"
import CoinGecko from "coingecko-api"
const CoinGeckoClient: any = new CoinGecko()

export const overallAssetsController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let coinArray: any = []
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result) => {
          if (result.length !== 0) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )

            await Promise.all(
              filterdata.map(async (key: any, i: number) => {
                let data = JSON.parse(JSON.stringify(key.coinPie))
                let coinUpdatedData = await coinData(data)

                coinUpdatedData.map(async (element: any, i: number) => {
                  await coinArray.push({
                    id: element._id,
                    image: element.image,
                    name: {
                      title: element.name,
                      subtitle: element.title,
                    },
                    balance: "500 USD",
                    action: "Trasnfer",
                  })
                })
              })
            )
            res.status(200).send({ tableBodyData: JSON.parse(coinArray) })
          } else {
            //mock data

            // res.status(404).send({
            //   error_message: "empty piefolio",
            // })
            res.status(200).send({
              tableBodyData: ([
                {
                  id: "xxx1",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  action: "Trasnfer",
                },
                {
                  id: "xxx2",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  action: "Trasnfer",
                },
                {
                  id: "xxx3",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  action: "Trasnfer",
                },
              ]),
            })
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

export const usdWalletAssetsController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let coinArray: any = []
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result) => {
          if (result.length !== 0) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )

            await Promise.all(
              filterdata.map(async (key: any, i: number) => {
                let data = JSON.parse(JSON.stringify(key.coinPie))
                let coinUpdatedData = await coinData(data)

                coinUpdatedData.map(async (element: any, i: number) => {
                  await coinArray.push({
                    id: element._id,
                    image: element.image,
                    name: {
                      title: element.name,
                      subtitle: element.title,
                    },
                    balance: "500 USD",
                    availableToInvest: "500 USD",
                    action: "Trasnfer",
                  })
                })
              })
            )
            res.status(200).send({ tableBodyData: JSON.parse(coinArray) })
          } else {
            //mock data
            // res.status(404).send({
            //   error_message: "empty piefolio",
            // })
            res.status(200).send({
              tableBodyData: [
                {
                  id: "xxx1",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  availableToInvest: "500 USD",
                  action: "Trasnfer",
                },
                {
                  id: "xxx2",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  availableToInvest: "500 USD",
                  action: "Trasnfer",
                },
                {
                  id: "xxx3",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  availableToInvest: "500 USD",
                  action: "Trasnfer",
                },
              ],
            })
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

export const coinWalletAssetsController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let coinArray: any = []
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result) => {
          if (result.length !== 0) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )

            await Promise.all(
              filterdata.map(async (key: any, i: number) => {
                let data = JSON.parse(JSON.stringify(key.coinPie))
                let coinUpdatedData = await coinData(data)

                coinUpdatedData.map(async (element: any, i: number) => {
                  await coinArray.push({
                    id: element._id,
                    image: element.image,
                    name: {
                      title: element.name,
                      subtitle: element.title,
                    },
                    balance: "500 USD",
                    availableToInvest: "500 USD",
                    action: "Trasnfer",
                  })
                })
              })
            )
            res.status(200).send({ tableBodyData: JSON.parse(coinArray) })
          } else {
            //mock data
            // res.status(404).send({
            //   error_message: "empty piefolio",
            // })
            res.status(200).send({
              tableBodyData: [
                {
                  id: "xxx1",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  availableToInvest: "500 USD",
                  action: "Trasnfer",
                },
                {
                  id: "xxx2",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  availableToInvest: "500 USD",
                  action: "Trasnfer",
                },
                {
                  id: "xxx3",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  balance: "500 USD",
                  availableToInvest: "500 USD",
                  action: "Trasnfer",
                },
              ],
            })
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

//common function
const coinData = async (coinPie: any) => {
  await Promise.all(
    await coinPie.map(async (key: any, i: number) => {
      let data = await CoinGeckoClient.coins.fetch(key.id, {})
      let title = await data.data.symbol.toUpperCase()
      coinPie[i]["title"] = title
      let image = await data.data.image.thumb
      coinPie[i]["image"] = image
      coinPie[i]["weightage"] = key.percentage
      let currentpricepercoin: number = await cryptoPrice(key.id)
      let diffrence =
        ((currentpricepercoin - key.pricePerCoin) / key.pricePerCoin) * 100
      coinPie[i]["currentPrice"] = currentpricepercoin
      coinPie[i]["diffrence"] = diffrence
    })
  )
  return coinPie
}
const cryptoPrice = async (id: string) => {
  let data: any = await CoinGeckoClient.coins.fetch(id, {})
  let currentpricepercoin = await data.data.market_data.current_price[
    String("usd")
  ]
  return currentpricepercoin
}
