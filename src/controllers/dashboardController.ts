import axios from "axios"
import { UserPie } from "./../models/userPieModel"
import { Request, Response } from "express"
import { ValidToken } from "../config/commonFunction"
import { TransactionHistory } from "../models/transactionHistoryModel"
import CoinGecko from "coingecko-api"
const CoinGeckoClient: any = new CoinGecko()
import _ from "lodash"

export const getNewsDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    res.status(200).send([
      {
        imageUrl:
          "https://storageapi.fleek.co/12f0f5bb-c8a7-4dc5-ac3f-5608ee9eb871-bucket/SenPie/Assets/News/1_website_now_live.png",
        redirectLink: "xxx",
      },
      {
        imageUrl:
          "https://storageapi.fleek.co/12f0f5bb-c8a7-4dc5-ac3f-5608ee9eb871-bucket/SenPie/Assets/News/2_roadmap.png",
        redirectLink: "xxx",
      },
      {
        imageUrl:
          "https://storageapi.fleek.co/12f0f5bb-c8a7-4dc5-ac3f-5608ee9eb871-bucket/SenPie/Assets/News/3_Learn_and_earn.png",
        redirectLink: "xxx",
      },
      {
        imageUrl:
          "https://storageapi.fleek.co/12f0f5bb-c8a7-4dc5-ac3f-5608ee9eb871-bucket/SenPie/Assets/News/4_learning_trading_managing.png",
        redirectLink: "xxx",
      },
    ])
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}

export const king_pieController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne(
        { email: tokenData.data.email, pieName: "King-Pie" },
        { pieAmount: 1, coinPie: 1 }
      )
        .then(async (result) => {
          if (result) {
            let data = JSON.parse(JSON.stringify(result.coinPie))
            let coinUpdatedData = await coinData(data)
            let coinReturnsData: any = await returnsData(data)
            let pieReturns = JSON.parse(JSON.stringify(coinReturnsData))

            let currentPieAmount = 0

            coinUpdatedData.map(async (key: any, i: number) => {
              currentPieAmount = currentPieAmount + key.currentPrice + key.count
            })

            coinUpdatedData.forEach((object: any) => {
              delete object["name"]
              delete object["id"]
              delete object["count"]
              delete object["percentage"]
              delete object["pricePerCoin"]
              delete object["currentPrice"]
              delete object["diffrence"]
              delete object["_id"]
              Object.assign(object, { color: randColor() })
            })
            res.status(200).send({
              currency: "$",
              currencyName: "USD",
              assetValue: result.pieAmount,
              returns: {
                day: (pieReturns.pieDayReturn / 100).toFixed(4),
                week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                year: (pieReturns.pieYearReturn / 100).toFixed(4),
                halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                month: (pieReturns.pieMonthReturn / 100).toFixed(4),
              },
              profitsGained: currentPieAmount - result.pieAmount,
              piesData: coinUpdatedData,
            })
          } else {
            //mock data
            // res.status(404).send({
            //   error_message: "King-pie not available",
            // })
            res.status(200).send({
              currency: "$",
              currencyName: "USD",
              assetValue: 3000,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              profitsGained: 1000,
              piesData: [
                {
                  color: "#ffffff",
                  title: "BTC",
                  weightage: 10,
                },
                {
                  color: "#ffffff",
                  title: "ETH",
                  weightage: 15,
                },
                {
                  title: "BNB",
                  weightage: 10,
                },
                {
                  color: "#ffffff",
                  title: "ADA",
                  weightage: 10,
                },
                {
                  color: "#ffffff",
                  title: "SOL",
                  weightage: 5,
                },
                {
                  color: "#ffffff",
                  title: "ALGO",
                  weightage: 10,
                },
                {
                  color: "#ffffff",
                  title: "DOT",
                  weightage: 10,
                },
                {
                  color: "#ffffff",
                  title: "AXS",
                  weightage: 10,
                },
                {
                  color: "#ffffff",
                  title: "ENJ",
                  weightage: 20,
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

export const recent_activitesController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      TransactionHistory.find({ userId: tokenData.data.id }, { __v: 0 })
        .then(async (result) => {
          if (result.length !== 0) {
            let data = JSON.parse(JSON.stringify(result))
            await Promise.all(
              await data.map(async (key: any, i: number) => {
                let coinUpdatedData = await coinData(key.actionData.coinPie)
                data[i].actionData.coinPie = coinUpdatedData
              })
            )
            const strcture = _(data)
              .groupBy("_id")
              .map((group, userId) => ({
                id: userId,
                image: group[0].actionData.coinPie[0].image,
                name: {
                  title: group[0].actionData.coinPie[0].name,
                  subtitle: group[0].actionData.coinPie[0].title,
                },
                action: group[0].action,
                pieName: group[0].actionData.pieName,
                value: group[0].amount,
                actionCode: group[0].actionCode,
                dateTime: group[0].createdAt,
              }))
            res.status(200).send({
              currency: JSON.parse("$"),
              currencyName: JSON.parse("USD"),
              tableBodyData: strcture,
            })
          } else {
            //mock data
            // res.status(404).send({ error_message: "recent_activity is empty" })
            res.status(200).send({
              currency: "$",
              currencyName: "USD",
              tableBodyData: [
                {
                  id: "xxx1",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  action: "Funds Added",
                  pieName: "Meme Pie",
                  value: 500,
                  actionCode: "ADD_FUND",
                  dateTime: "2022-03-25T12:21:06.767Z",
                },
                {
                  id: "xxx2",
                  image: "https://images.mudrex.com/ETH.png",
                  name: {
                    title: "Ethereum",
                    subtitle: "ETH",
                  },
                  action: "Funds Sold",
                  pieName: "Meme Pie",
                  value: -100,
                  actionCode: "SOLD_FUND",
                  dateTime: "2022-03-25T12:21:06.767Z",
                },
                {
                  id: "xxx3",
                  image: "https://images.mudrex.com/BNB.png",
                  name: {
                    title: "BNB",
                    subtitle: "BNB",
                  },
                  action: "Profit Booked",
                  pieName: "Meme Pie",
                  value: 10,
                  actionCode: "PROFIT_BOOKED",
                  dateTime: "2022-03-25T12:21:06.767Z",
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

export const investment_summaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let totalAssetValue: number = 0
    let investedValue: number = 0
    let Coin: any = []
    let coinUpdatedData: any
    let pieReturns: any
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result: IUserPie[]) => {
          if (result.length !== 0) {
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
                await Promise.all(
                  await data.map(async (key: any, i: number) => {
                    totalAssetValue = key.currentPieAmount + totalAssetValue
                    investedValue = key.pieAmount + investedValue
                    let data = JSON.parse(JSON.stringify(key.coinPie))
                    coinUpdatedData = await coinData(data)
                    let coinReturnsData: any = await returnsData(data)
                    pieReturns = JSON.parse(JSON.stringify(coinReturnsData))
                    await coinUpdatedData.forEach(async (e: any, i: number) => {
                      Coin.push(e)
                    })
                  })
                )

                let trendingCoins: any = await Promise.all(
                  _(Coin)
                    .groupBy("name")
                    .map(async (e: any, name: any) => ({
                      name,
                      title: e[0].title,
                      image: e[0].image,
                      currentPrice: e[0].currentPrice,
                      changedPrice: e[0].diffrence,
                    }))
                    .value()
                )
                trendingCoins.forEach((object: any) => {
                  delete object["name"]
                })

                res.status(200).send({
                  currency: "$",
                  currencyName: "USD",
                  assetValue: totalAssetValue,
                  returns: {
                    day: (pieReturns.pieDayReturn / 100).toFixed(4),
                    week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                    year: (pieReturns.pieYearReturn / 100).toFixed(4),
                    halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                    quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                    month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                  },
                  investedValue: investedValue,
                  pieSets: {
                    amount: investedValue,
                    assetValue: totalAssetValue,
                    returns: {
                      day: (pieReturns.pieDayReturn / 100).toFixed(4),
                      week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                      year: (pieReturns.pieYearReturn / 100).toFixed(4),
                      halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                      quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(
                        4
                      ),
                      month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                    },
                  },
                  trendingCoins: trendingCoins,
                })
              })
              .catch((err: Error) => {
                res.status(404).send({
                  error_message: err.message,
                })
              })
          } else {
            let RandomCoin: any
            await axios
              .get(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=%2024h"
              )
              .then(async (result: any) => {
                RandomCoin = result.data
              })

            let trending: any = await Promise.all(
              _(RandomCoin)
                .groupBy("id")
                .map(async (e: any, name: any) => ({
                  name: e[0].name,
                  title: e[0].symbol,
                  image: e[0].image,
                  currentPrice: e[0].current_price,
                  changedPrice: e[0].price_change_percentage_24h,
                }))
                .value()
            )

            let dataArray: any = await Promise.all(
              _(RandomCoin)
                .groupBy("id")
                .map(async (e: any, name: any) => ({
                  name: e[0].name,
                  id: e[0].id,
                  count: 1,
                  percentage: 100 / RandomCoin.length,
                  pricePerCoin: e[0].price_change_percentage_24h,
                }))
                .value()
            )
            let data = JSON.parse(JSON.stringify(dataArray))
            coinUpdatedData = await coinData(data)
            let coinReturnsData: any = await returnsData(coinUpdatedData)
            pieReturns = JSON.parse(JSON.stringify(coinReturnsData))

            res.status(200).send({
              currency: "$",
              currencyName: "USD",
              assetValue: totalAssetValue,
              returns: {
                day: (pieReturns.pieDayReturn / 100).toFixed(4),
                week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                year: (pieReturns.pieYearReturn / 100).toFixed(4),
                halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                month: (pieReturns.pieMonthReturn / 100).toFixed(4),
              },
              investedValue: investedValue,
              pieSets: {
                amount: investedValue,
                assetValue: totalAssetValue,
                returns: {
                  day: (pieReturns.pieDayReturn / 100).toFixed(4),
                  week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                  year: (pieReturns.pieYearReturn / 100).toFixed(4),
                  halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                  quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                  month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                },
              },
              trendingCoins: trending,
            })
          }
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401).send("unAuthorized")
    }
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
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

const returnsData = async (coinPie: any) => {
  let coinReturns
  let pieYearReturn = 0
  let pieHalfyearReturn = 0
  let pieQuaterReturn = 0
  let pieMonthReturn = 0
  let pieWeekReturn = 0
  let pieDayReturn = 0

  await Promise.all(
    await coinPie.map(async (key: any, i: number) => {
      let data: any = await CoinGeckoClient.coins.fetchMarketChart(key.id, {
        days: 366,
        interval: "daily",
      })

      let yearData = data.data.prices

      let yearlyDiffrence =
        ((yearData[yearData.length - 2][1] - yearData[0][1]) / yearData[0][1]) *
        100 *
        key.weightage
      let halfyearDiffrence =
        ((yearData[yearData.length - 2][1] - yearData[184][1]) /
          yearData[184][1]) *
        100 *
        key.weightage

      let quaterlyDiffrence =
        ((yearData[yearData.length - 2][1] - yearData[275][1]) /
          yearData[275][1]) *
        100 *
        key.weightage

      let monthlyDiffrence =
        ((yearData[yearData.length - 2][1] - yearData[334][1]) /
          yearData[334][1]) *
        100 *
        key.weightage
      let weeklyDiffrence =
        ((yearData[yearData.length - 2][1] - yearData[357][1]) /
          yearData[357][1]) *
        100 *
        key.weightage

      let dailyDiffrence =
        ((yearData[yearData.length - 2][1] - yearData[364][1]) /
          yearData[364][1]) *
        100 *
        key.weightage

      pieYearReturn = pieYearReturn + yearlyDiffrence
      pieHalfyearReturn = pieHalfyearReturn + halfyearDiffrence
      pieQuaterReturn = pieQuaterReturn + quaterlyDiffrence
      pieMonthReturn = pieMonthReturn + monthlyDiffrence
      pieWeekReturn = pieWeekReturn + weeklyDiffrence
      pieDayReturn = pieDayReturn + dailyDiffrence

      coinReturns = {
        pieYearReturn: pieYearReturn / 100,
        pieHalfyearReturn: pieHalfyearReturn / 100,
        pieQuaterReturn: pieQuaterReturn / 100,
        pieMonthReturn: pieMonthReturn / 100,
        pieWeekReturn: pieWeekReturn / 100,
        pieDayReturn: pieDayReturn / 100,
      }
    })
  )
  return coinReturns
}

const cryptoPrice = async (id: string) => {
  let data: any = await CoinGeckoClient.coins.fetch(id, {})
  let currentpricepercoin = await data.data.market_data.current_price[
    String("usd")
  ]
  return currentpricepercoin
}

const randColor = () => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  )
}
