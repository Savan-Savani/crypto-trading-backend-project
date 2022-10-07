import { Request, Response } from "express"
import { ValidToken } from "../config/commonFunction"
import { User } from "../models/userModel"
import { TransactionHistory } from "./../models/transactionHistoryModel"
import { UserPie } from "../models/userPieModel"
import axios from "axios"
import moment from "moment"
import _ from "lodash"
import CoinGecko from "coingecko-api"
import { CoinHistory } from "../models/coinHistoryModel"
const CoinGeckoClient = new CoinGecko()
require("dotenv").config()
const CC = require("currency-converter-lt")
let currencyConverter = new CC()

export const addFundsController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { amount } = req.body

    let USDAmount = await currencyConverter
      .from(`${req.query.currency}`)
      .to("USD")
      .amount(amount)
      .convert()
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      User.findOneAndUpdate(
        { email: tokenData.data.email },
        { $inc: { funds: USDAmount } }
      )
        .then(async (result: IUserPie) => {
          if (result) {
            await referUse(result._id)
            await TransactionHistory.create({
              userId: result._id,
              action: "Fund Added",
              amount: amount,
            })
            res.status(201).send({
              message: "Amount addeded Sucessfully",
            })
          } else {
            res.status(401).send({
              error_message: "User not fount,please try again later",
            })
          }
        })
        .catch((err: Error) => {
          res.status(400).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const buyPiesController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { amountInvest, pieId, coinPie, pieName, description } = req.body
    const tokenData = await ValidToken(bearerHeader)
    let piePrice = await coinPrice(coinPie)
    piePrice.map((key: any, i: number) => {
      let count = (amountInvest * key.percentage) / 100 / key.pricePerCoin
      piePrice[i]["count"] = count.toFixed(6)
    })
    if (tokenData) {
      UserPie.create({
        buyerId: tokenData.data.id,
        coinPie: piePrice,
        pieId: pieId,
        pieName: pieName,
        description: description,
        pieAmount: amountInvest,
        status: true,
      })
        .then(async (result: IUserPie) => {
          res.status(201).send({ data: result })
          await User.findOneAndUpdate(
            { email: tokenData.data.email },
            { $inc: { funds: -amountInvest } }
          )
          await referUse(result._id)
          await TransactionHistory.create({
            userId: tokenData.data.id,
            action: "Buy Coinpies",
            amount: amountInvest,
            actionCode: "ADD_FUND",
            actionData: result,
          })
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const getUserPiesController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let totalAssetValue: number = 0
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result: IUserPie[]) => {
          if (result) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )
            let data = JSON.parse(JSON.stringify(filterdata))
            await Promise.all(
              data.map(async (key: IUserPie, j: number) => {
                let newdata = JSON.parse(JSON.stringify(key.coinPie))
                let pieAmount: number = 0
                let newPriceData = await coinPrice(newdata)
                await newPriceData.map((key: IPieDetails, i: number) => {
                  pieAmount = pieAmount + key.currentPrice * key.count
                })
                data[j]["coinPie"] = newPriceData
                data[j]["currentPieAmount"] = pieAmount
              })
            )
              .then(async () => {
                await data.map((key: IPieDetails, i: number) => {
                  totalAssetValue = key.currentPieAmount + totalAssetValue
                })
                res.status(200).send({
                  data: data,
                  totalAsset: totalAssetValue,
                })
              })
              .catch((err: Error) => {
                res.status(401).send({
                  error_message: err.message,
                })
              })
          } else {
            res.status(400).send({
              error_message: "something went wrong",
            })
          }
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const getOnePieController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { pieId } = req.params
    let pieAmount: number = 0
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({ pieId: pieId, buyerId: tokenData.data.id })
        .then(async (result: IUserPie) => {
          if (result) {
            let pieResult = JSON.parse(JSON.stringify(result))
            let pieData = JSON.parse(JSON.stringify(result.coinPie))
            let priceData = await coinPrice(pieData)
            priceData.map((key: IPieDetails, i: number) => {
              pieAmount = pieAmount + key.currentPrice * key.count
            })
            pieResult.coinPie = priceData
            pieResult["currentPieAmount"] = pieAmount
            res.status(200).send({ data: pieResult })
          } else {
            res.status(401).send({
              error_message: "something went wrong",
            })
          }
        })
        .catch((err: Error) => {
          res.status(400).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const sellPieController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { pieId } = req.body
    let pieAmount: number = 0
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOneAndUpdate(
        { pieId: pieId, buyerId: tokenData.data.id },
        { status: false }
      )
        .then(async (result: IUserPie) => {
          if (result) {
            let pieData = JSON.parse(JSON.stringify(result.coinPie))
            let piePrice = await coinPrice(pieData)
            piePrice.map((key: IPieDetails, i: number) => {
              pieAmount = pieAmount + key.currentPrice * key.count
            })
            await User.findOneAndUpdate(
              { _id: result.buyerId },
              { $inc: { funds: pieAmount } }
            )
            await TransactionHistory.create({
              userId: result.buyerId,
              action: "pie sell amount Added",
              amount: pieAmount,
              actionCode: "SOLD_FUND",
              actionData: result,
            })
            res.status(200).send({
              message: "sell action successfull",
            })
          } else {
            res.status(404).send({
              error_message: "no pie available for selling",
            })
          }
        })
        .catch((err: Error) => {
          res.status(400).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const sellCoinFromPieController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { pieId, coinId, type } = req.body
    let percentage = req.body.percentage || 100
    let pieAmount: number
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({
        pieId: pieId,
        buyerId: tokenData.data.id,
        "coinPie._id": coinId,
      }).then(async (result: IUserPie) => {
        if (result) {
          if (percentage == 100) {
            let sellCoin = result.coinPie.filter(
              (e: IPieDetails) => e._id == coinId
            )
            let pieData = JSON.parse(JSON.stringify(sellCoin))
            let current_price = await coinPrice(pieData)
            pieAmount = current_price[0].count * current_price[0].pricePerCoin
            let amount = current_price[0].currentPrice * current_price[0].count
            let currentPercentage = 100 - current_price[0].percentage
            let coinData = result.coinPie.filter(
              (pie: IPieDetails) => pie._id != coinId
            )
            let updatedData = coinData.map((key: any, i: number) => {
              key.percentage = (100 * key.percentage) / currentPercentage
              return (coinData = key)
            })
            result["pieAmount"] = result.pieAmount - pieAmount
            await UserPie.findOneAndUpdate(
              {
                pieId: pieId,
                buyerId: tokenData.data.id,
                "coinPie._id": coinId,
              },
              { coinPie: updatedData, pieAmount: result.pieAmount },
              { new: true }
            )
            if (type != "replace") {
              await TransactionHistory.create({
                userId: result.buyerId,
                action: "coin sell amount Added",
                amount: amount,
                actionCode: "SOLD_FUND",
                "actionData.pieName": result.pieName,
                "actionData.coinPie": sellCoin,
              })
              await User.findOneAndUpdate(
                { _id: result.buyerId },
                { $inc: { funds: amount } }
              )
              res.status(200).send({
                message: ` sell successfull`,
                data: updatedData,
              })
            } else {
              await TransactionHistory.create({
                userId: result.buyerId,
                action: "coin replaced",
                amount: amount,
              })
              res.status(200).send({
                message: ` sell successfull`,
                data: updatedData,
                amount: amount,
              })
            }
          } else {
            let sellCoin = result.coinPie.filter(
              (amount: IPieDetails) => amount._id == coinId
            )
            let pieData = JSON.parse(JSON.stringify(sellCoin))
            let current_price = await coinPrice(pieData)
            let sellCount = (current_price[0].count * percentage) / 100
            pieAmount = sellCount * current_price[0].pricePerCoin
            let sellPercentage =
              (current_price[0].percentage * percentage) / 100
            let sellCoinAmount = current_price[0].currentPrice * sellCount
            current_price[0]["count"] = current_price[0].count - sellCount
            current_price[0]["percentage"] =
              current_price[0].percentage - sellPercentage
            let currentPercentage = 100 - sellPercentage
            let updatedData = result.coinPie.map((key: any, i: number) => {
              if (key._id == coinId) {
                key = current_price[0]
              }
              key.percentage = (100 * key.percentage) / currentPercentage
              return (result.coinPie = key)
            })
            result["pieAmount"] = result.pieAmount - pieAmount
            await UserPie.findOneAndUpdate(
              { pieId: pieId },
              { coinPie: updatedData, pieAmount: result.pieAmount },
              { new: true }
            )
            if (type != "replace") {
              await TransactionHistory.create({
                userId: result.buyerId,
                action: "coin sell amount Added",
                amount: sellCoinAmount,
                actionCode: "SOLD_FUND",
                "actionData.pieName": result.pieName,
                "actionData.coinPie": sellCoin,
              })
              await User.findOneAndUpdate(
                { _id: result.buyerId },
                { $inc: { funds: sellCoinAmount } }
              )
              res.status(200).send({
                message: ` sell successfull`,
                data: updatedData,
              })
            } else {
              await TransactionHistory.create({
                userId: result.buyerId,
                action: "coin replaced",
                amount: sellCoinAmount,
              })
              res.status(200).send({
                message: ` sell successfull`,
                data: updatedData,
                amount: sellCoinAmount,
              })
            }
          }
        } else {
          res.status(404).send({
            error_message: "Coinpie not found",
          })
        }
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const replaceCoinController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { pieId, coinId, newCoinId, percentage } = req.body
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({ pieId: pieId }).then(async (result: any) => {
        if (result) {
          let sellData = await sellCoinFromPie(
            result,
            bearerHeader,
            percentage,
            coinId
          )
          result["coinPie"] = sellData.data.data
          let addCoin = result.coinPie.find((e: any) => e.id == newCoinId)
          if (addCoin) {
            let newCoin = await cryptoDetail(newCoinId)
            let count = sellData.data.amount / newCoin.pricePerCoin
            addCoin.count = addCoin.count + count
          } else {
            let newCoin = await cryptoDetail(newCoinId)
            let count = sellData.data.amount / newCoin.pricePerCoin
            Object.assign(newCoin, { count: count })
            result.coinPie.push(newCoin)
          }
          let totalPieInvestment = 0
          result.coinPie.map((key: IPieDetails, i: number) => {
            totalPieInvestment =
              totalPieInvestment + key.count * key.pricePerCoin
          })
          result.coinPie.map((key: IPieDetails, i: number) => {
            key.percentage =
              ((key.count * key.pricePerCoin) / totalPieInvestment) * 100
          })
          UserPie.findOneAndUpdate(
            { pieId: result.pieId },
            { coinPie: result.coinPie, pieAmount: totalPieInvestment }
          )
            .then(() => {
              res.status(200).send({
                message: "coin replaced successfully",
              })
            })
            .catch((err: Error) => {
              res.status(401).send({
                error_message: err.message,
              })
            })
        }
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const bookProfitPieController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { pieId, profitPercentage } = req.body
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOneAndUpdate(
        { pieId: pieId },
        { bookProfit: profitPercentage, isBookProfit: true }
      )
        .then((result: IUserPie) => {
          res.status(200).send({
            message: "book profit set",
          })
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const bookProfitCoinController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { pieId, coinId, profitPercentage } = req.body
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({ pieId: pieId })
        .then((result: IUserPie) => {
          result.coinPie.map((key: IPieDetails, i: number) => {
            if (key._id == coinId) {
              key["bookProfit"] = profitPercentage
              key["isBookProfit"] = true
            }
          })
          UserPie.findOneAndUpdate(
            { pieId: pieId },
            { coinPie: result.coinPie }
          )
            .then(() => {
              res.status(200).send({
                message: "coin bookprofit set",
              })
            })
            .catch((err: Error) => {
              res.status(401).send({
                error_message: err.message,
              })
            })
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const cancelBookProfitController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { pieId } = req.body
    if (tokenData) {
      UserPie.findOneAndUpdate({ pieId: pieId }, { isBookProfit: false })
        .then(async (result: any) => {
          res.status(200).send({
            message: "auto book profit cancel",
          })
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const cancelCoinBookProfitController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { pieId, coinId } = req.body
    if (tokenData) {
      await UserPie.findOne({ pieId: pieId }).then(async (result) => {
        if (result) {
          await result.coinPie.map((key: any, index: number) => {
            if (key._id == coinId) {
              key.isBookProfit = false
            }
          })
        } else {
          res.status(404).send({
            error_message: "user not found",
          })
        }
        await UserPie.findOneAndUpdate(
          { _id: result._id },
          { coinPie: result.coinPie }
        )
          .then(() => {
            res.status(200).send({
              message: "auto bookprofit of coin cancel",
            })
          })
          .catch((err: Error) => {
            res.status(401).send({
              error_message: err.message,
            })
          })
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const historyController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      TransactionHistory.find({ userId: tokenData.data.id })
        .then(async (result: IUserPie[]) => {
          res.status(200).send({ data: result })
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const withdrawFundsController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { amount } = req.body
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      await User.findOneAndUpdate(
        { _id: tokenData.data.id },
        { $inc: { funds: -amount } }
      )
      await TransactionHistory.create({
        userId: tokenData.data.id,
        action: " amount withdraw ",
        amount: amount,
        actionCode: "Fund_Withdraw",
      })
      res.status(200).send({
        message: "withdraw successfull",
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const cheakAutoBookProfitController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let totalAssetValue: number = 0
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result: IUserPie[]) => {
          if (result) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )
            let data = JSON.parse(JSON.stringify(filterdata))
            await Promise.all(
              data.map(async (key: IUserPie, j: number) => {
                let newdata = JSON.parse(JSON.stringify(key.coinPie))
                let pieAmount: number = 0
                let newPriceData = await coinPrice(newdata)
                await newPriceData.map((key: IPieDetails, i: number) => {
                  pieAmount = pieAmount + key.currentPrice * key.count
                })
                data[j]["coinPie"] = newPriceData
                data[j]["currentPieAmount"] = pieAmount
              })
            )
              .then(async () => {
                await autoBookProfit(data, bearerHeader)
                await data.map((key: IPieDetails, i: number) => {
                  totalAssetValue = key.currentPieAmount + totalAssetValue
                })
                res.status(200).send({
                  data: data,
                  totalAsset: totalAssetValue,
                })
              })
              .catch((err: Error) => {
                res.status(401).send({
                  error_message: err.message,
                })
              })
          } else {
            res.status(401).send({
              error_message: "something went wrong",
            })
          }
        })
        .catch((err: Error) => {
          res.status(401).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const uniqeCoinListController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let Coin: any = []
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id }).then(
        async (result: IUserPie[]) => {
          if (result) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )
            if (filterdata) {
              filterdata.forEach((key: any, i: number) => {
                key.coinPie.forEach((key: any, i: number) => {
                  Coin.push(key)
                })
              })
            }
            let uniqueCoin = await Promise.all(
              _(Coin)
                .groupBy("name")
                .map(async (e: any, name: any) => ({
                  name,
                  priceperCoin: e[0].pricePerCoin,
                  count: _.sumBy(e, "count"),
                }))
                .value()
            )
            if (uniqueCoin) {
              res.status(200).send({ data: uniqueCoin })
            } else {
              res.status(401).send({
                error_message: "something went wrong",
              })
            }
          } else {
            res.status(401).send({
              error_message: "something went wrong",
            })
          }
        }
      )
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const buyCoinController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    const { coin, amount } = req.body
    if (tokenData) {
      const coinData = await coinDetail(coin)
      await CoinHistory.create({
        userId: tokenData.data.id,
        coin: coin,
        symbol: `${coinData.symbol}/USDT`,
        amount: amount,
        action: "Buy",
        pricePerCoin: coinData.currentpricepercoin,
        count: amount / coinData.currentpricepercoin,
      }).then(() => {
        res.status(200).send({ message: "coin Buy successfull" })
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const sellCoinController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    const { coin, amount } = req.body
    if (tokenData) {
      const coinData = await coinDetail(coin)
      await CoinHistory.create({
        userId: tokenData.data.id,
        coin: coin,
        symbol: `${coinData.symbol}/USDT`,
        amount: amount,
        action: "Sell",
        pricePerCoin: coinData.currentpricepercoin,
        count: amount / coinData.currentpricepercoin,
      }).then(() => {
        res.status(200).send({ message: "coin Sell successfull" })
      })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

//comman functions
const coinPrice = async (coinPie: any) => {
  await Promise.all(
    coinPie.map(async (key: any, i: number) => {
      if ("pricePerCoin" in key) {
        let currentpricepercoin: number = await cryptoPrice(key.id)
        let diffrence =
          ((currentpricepercoin - key.pricePerCoin) / key.pricePerCoin) * 100
        coinPie[i]["currentPrice"] = currentpricepercoin
        coinPie[i]["diffrence"] = diffrence
      } else {
        let pricepercoin: number = await cryptoPrice(key.id)
        coinPie[i]["pricePerCoin"] = pricepercoin
      }
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
const cryptoDetail = async (id: string) => {
  let data: any = await CoinGeckoClient.coins.fetch(id, {})
  let currentpricepercoin = await data.data.market_data.current_price[
    String("usd")
  ]
  return {
    name: data.data.name,
    id: data.data.id,
    pricePerCoin: currentpricepercoin,
  }
}
const coinDetail = async (id: string) => {
  let data: any = await CoinGeckoClient.coins.fetch(id, {})
  let currentpricepercoin = await data.data.market_data.current_price[
    String("usd")
  ]
  let symbol = await data.data.symbol.toUpperCase()
  return { currentpricepercoin, symbol }
}

const autoBookProfit = async (data: any, token: any) => {
  const headers = {
    "Content-Type": "application/json",
    token: token,
  }
  data.forEach(async (key: any, i: number) => {
    if (key) {
      if (key.status) {
        if (
          key.isBookProfit == true &&
          key.currentPieAmount >
            key.pieAmount + (key.pieAmount * key.bookProfit) / 100
        ) {
          await axios.post(
            `${process.env.BACKEND_URL}/transaction/sellPie?currency=usd`,
            { pieId: key.pieId },
            { headers: headers }
          )
        } else {
          key.coinPie.forEach(async (e: any, i: number) => {
            if (
              e.isBookProfit == true &&
              e.currentPrice >
                e.pricePerCoin + (e.pricePerCoin * e.bookProfit) / 100
            ) {
              await axios.post(
                `${process.env.BACKEND_URL}/transaction/sellCoinFromPie?currency=usd`,
                { pieId: key.pieId, coinId: e._id },
                { headers: headers }
              )
            }
          })
        }
      }
    }
  })
}

const sellCoinFromPie = async (
  data: any,
  token: any,
  percentage: number,
  coinId: String
) => {
  const headers = {
    "Content-Type": "application/json",
    token: token,
  }
  let sellCoin = data.coinPie.find((e: any) => e._id.toString() === coinId)
  return await axios.post(
    `${process.env.BACKEND_URL}/transaction/sellCoinFromPie?currency=usd`,
    {
      pieId: data.pieId,
      coinId: sellCoin._id,
      percentage: percentage,
      type: "replace",
    },
    { headers: headers }
  )
}

const referUse = async (id: any) => {
  await User.findOne({ _id: id }).then(async (result) => {
    if (result) {
      if (
        result.referData.referById != "" &&
        result.referData.isUsed == false
      ) {
        await OfferAddOnRefer(result.referData.referById)
        await User.findOneAndUpdate({ _id: id }, { "referData.isUsed": true })
      }
    }
  })
}
const OfferAddOnRefer = async (referralCode: string) => {
  if (referralCode && referralCode.length === 11) {
    let referByData = await User.findOne({
      "referData.referralCode": referralCode,
    })
    let newDate
    if (moment() > moment(referByData.referData.offerExpire)) {
      newDate = moment().add(3, "M").format()
    } else {
      newDate = moment(referByData.referData.offerExpire).add(3, "M").format()
    }
    await User.findOneAndUpdate(
      {
        "referData.referralCode": referralCode,
      },
      { "referData.offerExpire": newDate }
    )
  }
}
