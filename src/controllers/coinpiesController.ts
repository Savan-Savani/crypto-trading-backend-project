import { CoinPies } from "../models/coinpiesModel"
import { Request, Response } from "express"
import CoinGecko from "coingecko-api"
const CoinGeckoClient: any = new CoinGecko()
import { ValidToken } from "../config/commonFunction"

export const getCoinController = async (req: Request, res: Response) => {
  try {
    let data = await CoinGeckoClient.coins.markets()
    let coinPie = [{}]
    data.data.map((key: any, i: number) => {
      coinPie.push({
        name: key.name,
        id: key.id,
        image: key.image,
        title: key.symbol.toUpperCase(),
      })
    })
    if (coinPie) {
      res.status(200).send({ data: coinPie })
    } else {
      res.status(400).send({
        error_message: "something wrong",
      })
    }
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

export const getCoinpiesController = async (req: Request, res: Response) => {
  try {
    CoinPies.find({})
      .then(async (result: any) => {
        let pieData = JSON.parse(JSON.stringify(result))
        await Promise.all(
          await pieData.map(async (key: any, i: number) => {
            let newdata = JSON.parse(JSON.stringify(key.coinPies))
            let data = await coinPrice(newdata)
            pieData[i]["coinPies"] = data
          })
        )
          .then(() => {
            res.status(200).send({ data: pieData })
          })
          .catch((err: Error) => {
            res.status(404).send({
              error_message: err.message,
            })
          })
      })
      .catch((err: Error) => {
        res.status(404).send({
          error_message: err.message,
        })
      })
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

export const addCoinpieController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { coinPie, pieName, description } = req.body
    let totalPercentage = 0
    coinPie.map((key: string, i: number) => {
      totalPercentage = coinPie[i].percentage + totalPercentage
    })
    if (totalPercentage == 100) {
      const tokenData = await ValidToken(bearerHeader)
      if (tokenData) {
        CoinPies.create({
          userId: tokenData.data.id,
          pieName: pieName,
          description: description,
          coinPies: coinPie,
        })
          .then(() => {
            res.status(201).send({
              message: "coinpie added successfully",
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
    } else {
      res.status(401).send({
        error_message: "total percentage of coin must be 100%",
      })
    }
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

export const updateCoinpiesController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { coinPie, pieName, description } = req.body
    let { id } = req.params
    let totalPercentage = 0
    coinPie.map((key: string, i: number) => {
      totalPercentage = coinPie[i].percentage + totalPercentage
    })
    if (totalPercentage == 100) {
      const tokenData = await ValidToken(bearerHeader)
      if (tokenData) {
        CoinPies.findOneAndUpdate(
          { _id: id },
          { coinPies: coinPie, pieName: pieName, description: description }
        )
          .then(() => {
            res.status(200).send({
              message: "coinpie updated successfully",
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
    } else {
      res.status(401).send({
        error_message: "total percentage of coin must be 100%",
      })
    }
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

export const deleteCoinpiesController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { id } = req.params
    if (tokenData) {
      CoinPies.findOneAndDelete({ _id: id })
        .then(() => {
          res.status(200).send({
            message: "coinpie deleted  successfully",
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
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

export const getUserCoinpiesController = async (
  req: Request,
  res: Response
) => {
  try {
    let { id } = req.params
    const tokenData = await ValidToken(id)
    if (tokenData) {
      CoinPies.find({ userId: tokenData.data.id }).then(async (result: any) => {
        let coinPiesData = JSON.parse(JSON.stringify(result))
        await Promise.all(
          await coinPiesData.map(async (key: any, j: number) => {
            let dataArray = JSON.parse(JSON.stringify(key.coinPies))
            await Promise.all(
              await dataArray.map(async (key: any, i: number) => {
                let data: any = await CoinGeckoClient.coins.fetch(key.id, {})
                let pricepercoin =
                  data.data.market_data.current_price[String("usd")]
                dataArray[i]["pricepercoin"] = pricepercoin
              })
            )
            coinPiesData[j]["coinPies"] = dataArray
          })
        )
          .then(() => {
            res.status(200).send({
              data: coinPiesData,
            })
          })
          .catch((err: Error) => {
            res.status(404).send({
              error_message: err.message,
            })
          })
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

//comman functoins
const coinPrice = async (coinPie: any) => {
  await Promise.all(
    await coinPie.map(async (key: any, i: number) => {
      let pricepercoin: number = await cryptoPrice(key.id)
      coinPie[i]["currentPricePerCoin"] = pricepercoin
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
