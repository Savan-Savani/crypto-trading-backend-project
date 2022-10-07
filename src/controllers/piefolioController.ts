import { UserPie } from "./../models/userPieModel"
import { Request, Response } from "express"
import { ValidToken } from "../config/commonFunction"
import CoinGecko from "coingecko-api"
import _ from "lodash"
import { User } from "../models/userModel"
const CoinGeckoClient: any = new CoinGecko()

export const overall_statsController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let days = req.body.days || 7
    if (tokenData) {
      let assestValue: number = 0
      let totalInvestedValue: number = 0
      let coin: any = []
      let performanceTableData: any = []
      let pieReturns: any
      let newGraphData: any

      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result: any) => {
          if (result.length !== 0) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )
            let data = JSON.parse(JSON.stringify(filterdata))
            let perforamanceGraphData = await graph(data, days)
            newGraphData = JSON.parse(JSON.stringify(perforamanceGraphData))

            await Promise.all(
              data.map(async (key: IUserPie, j: number) => {
                let newdata = JSON.parse(JSON.stringify(key.coinPie))

                let currentPieAmount: number = 0
                let InvestedAmount: number = 0
                let newPriceData = await coinData(newdata)
                let pieReturn: any = await pieReturnsData(newdata)
                pieReturns = JSON.parse(JSON.stringify(pieReturn))

                await Promise.all(
                  await newPriceData.map(async (key: any, i: number) => {
                    coin.push(key)
                    let coinReturn: any = await coinReturnsData(key)

                    await performanceTableData.push({
                      id: i,
                      image: key.image,
                      name: {
                        title: key.name,
                        subtitle: key.title.toUpperCase(),
                      },
                      returns: {
                        day: (coinReturn.pieDayReturn / 100).toFixed(4),
                        week: (coinReturn.pieWeekReturn / 100).toFixed(4),
                        year: (coinReturn.pieYearReturn / 100).toFixed(4),
                        halfYear: (coinReturn.pieHalfyearReturn / 100).toFixed(
                          4
                        ),
                        quarterYear: (coinReturn.pieQuaterReturn / 100).toFixed(
                          4
                        ),
                        month: (coinReturn.pieMonthReturn / 100).toFixed(4),
                      },
                      value: key.currentPrice * key.count,
                    })

                    currentPieAmount =
                      currentPieAmount + key.currentPrice * key.count
                    InvestedAmount =
                      InvestedAmount + key.pricePerCoin * key.count
                  })
                )
                data[j]["coinPie"] = newPriceData
                data[j]["currentPieAmount"] = currentPieAmount
                assestValue = currentPieAmount + assestValue
                totalInvestedValue = InvestedAmount + totalInvestedValue
              })
            ).then(async () => {
              let trendingCoins: any = await Promise.all(
                _(coin)
                  .groupBy("name")
                  .map(async (e: any) => ({
                    color: randColor(),
                    image: e[0].image,
                    title: e[0].name,
                    weightage: _.sumBy(e, "weightage"),
                  }))
                  .value()
              )
              let totalWeightage: number = 0
              trendingCoins.forEach((key: any) => {
                totalWeightage = totalWeightage + key.weightage
              })
              trendingCoins.forEach((key: any, i: number) => {
                key.weightage = (key.weightage / totalWeightage) * 100
              })
              let TableData: any = await Promise.all(
                _(performanceTableData)
                  .groupBy("name.title")
                  .map(async (e: any) => ({
                    id: e[0].id,
                    image: e[0].image,
                    name: e[0].name,
                    returns: e[0].returns,
                    value: _.sumBy(e, "value"),
                  }))
                  .value()
              )
              res.status(200).send({
                assetValue: assestValue,
                returns: {
                  day: (pieReturns.pieDayReturn / 100).toFixed(4),
                  week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                  year: (pieReturns.pieYearReturn / 100).toFixed(4),
                  halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                  quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                  month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                },
                profitsGained: assestValue - totalInvestedValue,
                piesData: trendingCoins,
                perforamanceGraphData: newGraphData,
                performanceTableData: TableData,
              })
            })
          } else {
            //mock data
            res.status(200).send({
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
                  color: "#ffff",
                  title: "Meme Pie 1",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "Meme Pie 2",
                  weightage: 15,
                },
                {
                  color: "#ffff",
                  title: "Meme Pie 3",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "Mem Pie 4",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 1",
                  weightage: 5,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 2",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 3",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "AXS",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "ENJ",
                  weightage: 20,
                },
              ],
              perforamanceGraphData: {
                timestamps: [
                  1613658240, 1614707580, 1615762320, 1616811660, 1617861000,
                  1618919340, 1619985720, 1621035060, 1622084400, 1623133740,
                  1624183080, 1625232420, 1626281760, 1627331100, 1628380440,
                  1629445980, 1630495320, 1631544660, 1632594000, 1633650540,
                  1634699880, 1635749220, 1636798560, 1637847900, 1638897240,
                  1639946580, 1640995920, 1642045260, 1643094600, 1644143940,
                  1645193280,
                ],
                values: [
                  48, 4, 24, 18, 44, 79, 70, 13, 59, 84, 3, 37, 78, 67, 54, 50,
                  3, 26, 1, 1, 0, 16, 72, 8, 40, 44, 48, 100, 40, 27, 28, 7, 94,
                ],
              },
              performanceTableData: [
                {
                  id: "xxx1",
                  image: "https://images.mudrex.com/BTC.png",
                  name: {
                    title: "BitCoin",
                    subtitle: "BTC",
                  },
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  value: "$500",
                },
                {
                  id: "xxx2",
                  image: "https://images.mudrex.com/ETH.png",
                  name: {
                    title: "Ethereum",
                    subtitle: "ETH",
                  },
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  value: "$300",
                },
                {
                  id: "xxx3",
                  image: "https://images.mudrex.com/BNB.png",
                  name: {
                    title: "BNB",
                    subtitle: "BNB",
                  },
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  value: "$900",
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
      res.status(401).send({ error_message: "unAuthorized" })
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}

export const my_piesController = async (req: Request, res: Response) => {
  try {
    let { category }: any = req.query
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let pieReturns: any
    if (tokenData) {
      let tableData: any = []
      let cardsData: any = []
      let cardsTableData: any = []
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result: any) => {
          if (result.length !== 0) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )
            let data = JSON.parse(JSON.stringify(filterdata))
            await Promise.all(
              await data.map(async (key: IUserPie, j: number) => {
                let newdata = JSON.parse(JSON.stringify(key.coinPie))
                let piesData: any = []
                let newPriceData = await coinData(newdata)
                let pieReturn: any = await pieReturnsData(newdata)
                pieReturns = JSON.parse(JSON.stringify(pieReturn))
                await Promise.all(
                  await newPriceData.map(async (element: any, i: number) => {
                    await piesData.push({
                      color: randColor(),
                      image: element.image,
                      title: element.title,
                      weightage: element.weightage,
                    })
                    let coinReturn: any = await coinReturnsData(element)
                    await cardsTableData.push({
                      id: element._id,
                      image: element.image,
                      name: {
                        title: element.name,
                        subtitle: element.title.toUpperCase(),
                      },
                      returns: {
                        day: (coinReturn.pieDayReturn / 100).toFixed(4),
                        week: (coinReturn.pieWeekReturn / 100).toFixed(4),
                        year: (coinReturn.pieYearReturn / 100).toFixed(4),
                        halfYear: (coinReturn.pieHalfyearReturn / 100).toFixed(
                          4
                        ),
                        quarterYear: (coinReturn.pieQuaterReturn / 100).toFixed(
                          4
                        ),
                        month: (coinReturn.pieMonthReturn / 100).toFixed(4),
                      },
                      yourFunds: element.currentPrice * element.count,
                    })
                  })
                )
                await tableData.push({
                  id: j,
                  name: key.pieName,
                  returns: {
                    day: (pieReturns.pieDayReturn / 100).toFixed(4),
                    week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                    year: (pieReturns.pieYearReturn / 100).toFixed(4),
                    halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                    quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                    month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                  },
                  pieValue: key.pieAmount,
                  piesData: piesData,
                })

                await cardsData.push({
                  id: key._id,
                  title: key.pieName,
                  pieValue: key.pieAmount,
                  returns: {
                    day: (pieReturns.pieDayReturn / 100).toFixed(4),
                    week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                    year: (pieReturns.pieYearReturn / 100).toFixed(4),
                    halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                    quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                    month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                  },
                  assetsCount: piesData.length,
                  piesData: piesData,
                  tableData: cardsTableData,
                })
              })
            ).then(() => {
              res.status(200).send({
                currency: "$",
                currencyName: "USD",
                tableData: tableData,
                cardsData: cardsData,
              })
            })
          } else {
            //mock data
            res.status(200).send({
              currency: "$",
              currencyName: "USD",
              tableData: [
                {
                  id: "xxx1",
                  name: "Meme Pie 1",
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 500,
                  piesData: [
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BTC.png",
                      title: "BTC",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ETH.png",
                      title: "ETH",
                      weightage: 15,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BNB.png",
                      title: "BNB",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ADA.png",
                      title: "ADA",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/SOL.png",
                      title: "SOL",
                      weightage: 5,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ALGO.png",
                      title: "ALGO",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/DOT.png",
                      title: "DOT",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/AXS.png",
                      title: "AXS",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ENJ.png",
                      title: "ENJ",
                      weightage: 20,
                    },
                  ],
                },
                {
                  id: "xxx2",
                  name: "Meme Pie 2",
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 100,
                  piesData: [
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BTC.png",
                      title: "BTC",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ETH.png",
                      title: "ETH",
                      weightage: 15,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BNB.png",
                      title: "BNB",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ADA.png",
                      title: "ADA",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/SOL.png",
                      title: "SOL",
                      weightage: 5,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ALGO.png",
                      title: "ALGO",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/DOT.png",
                      title: "DOT",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/AXS.png",
                      title: "AXS",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ENJ.png",
                      title: "ENJ",
                      weightage: 20,
                    },
                  ],
                },
                {
                  id: "xxx3",
                  name: "Meme Pie 2",
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 500,
                  piesData: [
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BTC.png",
                      title: "BTC",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ETH.png",
                      title: "ETH",
                      weightage: 15,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BNB.png",
                      title: "BNB",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ADA.png",
                      title: "ADA",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/SOL.png",
                      title: "SOL",
                      weightage: 5,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ALGO.png",
                      title: "ALGO",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/DOT.png",
                      title: "DOT",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/AXS.png",
                      title: "AXS",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ENJ.png",
                      title: "ENJ",
                      weightage: 20,
                    },
                  ],
                },
              ],
              cardsData: [
                {
                  id: "xxx1",
                  title: "Meme Pie",
                  pieValue: 3000,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  assetsCount: 10,
                  piesData: [
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BTC.png",
                      title: "BTC",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ETH.png",
                      title: "ETH",
                      weightage: 15,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/BNB.png",
                      title: "BNB",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ADA.png",
                      title: "ADA",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/SOL.png",
                      title: "SOL",
                      weightage: 5,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ALGO.png",
                      title: "ALGO",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/DOT.png",
                      title: "DOT",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/AXS.png",
                      title: "AXS",
                      weightage: 10,
                    },
                    {
                      color: "#ffff",
                      image: "https://images.mudrex.com/ENJ.png",
                      title: "ENJ",
                      weightage: 20,
                    },
                  ],
                  tableData: [
                    {
                      id: "xxx1",
                      image: "https://images.mudrex.com/BTC.png",
                      name: {
                        title: "BitCoin",
                        subtitle: "BTC",
                      },
                      returns: {
                        day: 10,
                        week: 10,
                        year: 80,
                        halfYear: 50,
                        quarterYear: 10,
                        month: 0,
                      },
                      yourFunds: 300,
                    },
                    {
                      id: "xxx2",
                      image: "https://images.mudrex.com/ETH.png",
                      name: {
                        title: "Ethereum",
                        subtitle: "ETH",
                      },
                      returns: {
                        day: 10,
                        week: 10,
                        year: 80,
                        halfYear: 50,
                        quarterYear: 10,
                        month: 0,
                      },
                      yourFunds: 100,
                    },
                  ],
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
    res.status(404).send({ error_message: error.message })
  }
}

export const customize_king_pieController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let walletBalance: number
    let totalAssetValue: number = 0
    let coins: any = []
    let totalCoinPercentage: number = 0
    let currentPieAmount: number = 0
    let piesData: any = []
    let piesTableData: any = []

    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result: any) => {
          if (result.length !== 0) {
            let filterdata = result.filter(
              (e: IUserPie) => e.status == true && e.coinPie.length != 0
            )
            await User.findOne(
              { email: tokenData.data.email },
              { funds: 1 }
            ).then(async (userDetails) => {
              walletBalance = userDetails.funds
            })
            let data = JSON.parse(JSON.stringify(filterdata))
            await Promise.all(
              await data.map(async (key: IUserPie, j: number) => {
                totalAssetValue = totalAssetValue + key.pieAmount
                let newdata = JSON.parse(JSON.stringify(key.coinPie))
                let newPriceData: any = await coinData(newdata)
                key["coinPie"] = newPriceData
                await Promise.all(
                  newPriceData.map(async (e: any, i: number) => {
                    await coins.push(e)
                    currentPieAmount =
                      currentPieAmount + e.count * e.currentPrice
                    totalCoinPercentage = totalCoinPercentage + e.percentage
                  })
                )
                await piesData.push({
                  color: randColor(),
                  title: key.pieName,
                  weightage: parseFloat(
                    ((key.pieAmount * 100) / totalAssetValue).toFixed(4)
                  ),
                })
              })
            )
            await Promise.all(
              await coins.map(async (key: any) => {
                key.weightage = (key.weightage * 100) / totalCoinPercentage
              })
            )
            let allPieReturn: any = await pieReturnsData(coins)
            await Promise.all(
              await data.map(async (key: any) => {
                let particularPieReturn: any = await pieReturnsData(key.coinPie)

                let TableData: any = await Promise.all(
                  _(key.coinPie)
                    .groupBy("name")
                    .map(async (e: any) => ({
                      color: randColor(),
                      image: e[0].image,
                      title: e[0].title,
                      weightage: e[0].percentage,
                    }))
                    .value()
                )
                await piesTableData.push({
                  pieId: key._id,
                  weightage: parseFloat(
                    ((key.pieAmount * 100) / totalAssetValue).toFixed(4)
                  ),
                  assetsCount: key.coinPie.length,
                  returns: {
                    day: parseFloat(
                      (particularPieReturn.pieDayReturn / 100).toFixed(4)
                    ),
                    week: parseFloat(
                      (particularPieReturn.pieWeekReturn / 100).toFixed(4)
                    ),
                    year: parseFloat(
                      (particularPieReturn.pieYearReturn / 100).toFixed(4)
                    ),
                    halfYear: parseFloat(
                      (particularPieReturn.pieHalfyearReturn / 100).toFixed(4)
                    ),
                    quarterYear: parseFloat(
                      (particularPieReturn.pieQuaterReturn / 100).toFixed(4)
                    ),
                    month: parseFloat(
                      (particularPieReturn.pieMonthReturn / 100).toFixed(4)
                    ),
                  },
                  pieValue: key.pieAmount,
                  pieDetails: {
                    name: key.pieName,
                    piesData: TableData,
                  },
                })
              })
            )
            res.status(200).send({
              walletBalance: walletBalance,
              currency: "$",
              currencyName: "USD",
              assetValue: totalAssetValue,
              returns: {
                day: parseFloat((allPieReturn.pieDayReturn / 100).toFixed(4)),
                week: parseFloat((allPieReturn.pieWeekReturn / 100).toFixed(4)),
                year: parseFloat((allPieReturn.pieYearReturn / 100).toFixed(4)),
                halfYear: parseFloat(
                  (allPieReturn.pieHalfyearReturn / 100).toFixed(4)
                ),
                quarterYear: parseFloat(
                  (allPieReturn.pieQuaterReturn / 100).toFixed(4)
                ),
                month: parseFloat(
                  (allPieReturn.pieMonthReturn / 100).toFixed(4)
                ),
              },
              profitsGained: currentPieAmount - totalAssetValue,
              piesData: piesData,
              piesTableData: piesTableData,
            })
          } else {
            //mock data
            res.status(200).send({
              walletBalance: 5000,
              currency: "$",
              currencyName: "USD",
              assetValue: 10000,
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
                  color: "#ffff",
                  title: "Meme Pie 1",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "Meme Pie 2",
                  weightage: 15,
                },
                {
                  color: "#ffff",
                  title: "Meme Pie 3",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "Mem Pie 4",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 1",
                  weightage: 5,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 2",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 3",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 4",
                  weightage: 10,
                },
                {
                  color: "#ffff",
                  title: "NFT Pie 5",
                  weightage: 20,
                },
              ],
              piesTableData: [
                {
                  pieId: "xx1",
                  weightage: 20,
                  assetsCount: 3,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 2000,
                  pieDetails: {
                    name: "Meme Pie 1",
                    piesData: [
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/BTC.png",
                        title: "BTC",
                        weightage: 80,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/ETH.png",
                        title: "ETH",
                        weightage: 10,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/BNB.png",
                        title: "BNB",
                        weightage: 10,
                      },
                    ],
                  },
                },
                {
                  pieId: "xx2",
                  weightage: 60,
                  assetsCount: 3,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 6000,
                  pieDetails: {
                    name: "Meme Pie 2",
                    piesData: [
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/BNB.png",
                        title: "BNB",
                        weightage: 10,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/ADA.png",
                        title: "ADA",
                        weightage: 10,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/SOL.png",
                        title: "SOL",
                        weightage: 40,
                      },
                    ],
                  },
                },
                {
                  pieId: "xx3",
                  weightage: 10,
                  assetsCount: 3,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 1000,
                  pieDetails: {
                    name: "Meme Pie 3",
                    piesData: [
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/ETH.png",
                        title: "ETH",
                        weightage: 15,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/BNB.png",
                        title: "BNB",
                        weightage: 10,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/ADA.png",
                        title: "ADA",
                        weightage: 10,
                      },
                    ],
                  },
                },
                {
                  pieId: "xx4",
                  weightage: 10,
                  assetsCount: 2,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
                  pieValue: 1000,
                  pieDetails: {
                    name: "Meme Pie 4",
                    piesData: [
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/ETH.png",
                        title: "ETH",
                        weightage: 15,
                      },
                      {
                        color: "ffffff",
                        image: "https://images.mudrex.com/BNB.png",
                        title: "BNB",
                        weightage: 10,
                      },
                    ],
                  },
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
    res.status(404).send({ error_message: error.message })
  }
}

export const addFunds_king_pieController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { data } = req.body
    if (tokenData) {
      if (data) {
        await Promise.all(
          await data.map(async (key: any) => {
            await UserPie.findOneAndUpdate(
              { _id: key.pieId },
              { $inc: { pieAmount: key.addFundsValue } }
            )
          })
        )
        res.status(200).send({})
      } else {
        //mock data
        // res.status(404).send({ error_message: "data not found" })
        res.status(200).send({
          data: [
            {
              pieId: "xx1",
              weightage: 20.454545454545453,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 2250,
              pieDetails: {
                name: "Meme Pie 1",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BTC.png",
                    title: "BTC",
                    weightage: 80,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                ],
              },
              addFundsValue: 250,
            },
            {
              pieId: "xx2",
              weightage: 56.81818181818182,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 6250,
              pieDetails: {
                name: "Meme Pie 2",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ADA.png",
                    title: "ADA",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/SOL.png",
                    title: "SOL",
                    weightage: 40,
                  },
                ],
              },
              addFundsValue: 250,
            },
            {
              pieId: "xx3",
              weightage: 11.363636363636363,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1250,
              pieDetails: {
                name: "Meme Pie 3",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 15,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ADA.png",
                    title: "ADA",
                    weightage: 10,
                  },
                ],
              },
              addFundsValue: 250,
            },
            {
              pieId: "xx4",
              weightage: 11.363636363636363,
              assetsCount: 2,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1250,
              pieDetails: {
                name: "Meme Pie 4",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 15,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                ],
              },
              addFundsValue: 250,
            },
          ],
        })
      }
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}
export const sellFunds_king_pieController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { data } = req.body
    if (tokenData) {
      if (data) {
        await Promise.all(
          await data.map(async (key: any) => {
            await UserPie.findOneAndUpdate(
              { _id: key.pieId },
              { $inc: { pieAmount: -key.sellFundsValue } }
            )
          })
        )
        res.status(200).send({})
      } else {
        //mock data
        // res.status(404).send({ error_message: "data not found" })
        res.status(200).send({
          data: [
            {
              pieId: "xx1",
              weightage: 19.911903093402742,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1989,
              pieDetails: {
                name: "Meme Pie 1",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BTC.png",
                    title: "BTC",
                    weightage: 80,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                ],
              },
              sellFundsValue: 11,
            },
            {
              pieId: "xx2",
              weightage: 60.06607267994794,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 6000,
              pieDetails: {
                name: "Meme Pie 2",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ADA.png",
                    title: "ADA",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/SOL.png",
                    title: "SOL",
                    weightage: 40,
                  },
                ],
              },
              sellFundsValue: 0,
            },
            {
              pieId: "xx3",
              weightage: 10.011012113324657,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1000,
              pieDetails: {
                name: "Meme Pie 3",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 15,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ADA.png",
                    title: "ADA",
                    weightage: 10,
                  },
                ],
              },
              sellFundsValue: 0,
            },
            {
              pieId: "xx4",
              weightage: 10.011012113324657,
              assetsCount: 2,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1000,
              pieDetails: {
                name: "Meme Pie 4",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 15,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                ],
              },
              sellFundsValue: 0,
            },
          ],
        })
      }
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}

export const bookProfitController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { data } = req.body
    if (tokenData) {
      if (data) {
        await Promise.all(
          await data.map(async (key: any) => {
            await UserPie.findOneAndUpdate(
              { _id: key.pieId },
              { $inc: { pieAmount: -key.bookProfitValue } }
            )
          })
        )
        res.status(200).send({})
      } else {
        //mock data
        // res.status(404).send({ error_message: "data not found" })
        res.status(200).send({
          data: [
            {
              pieId: "xx1",
              weightage: 20,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 2000,
              pieDetails: {
                name: "Meme Pie 1",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BTC.png",
                    title: "BTC",
                    weightage: 80,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                ],
              },
              bookProfitValue: 4,
            },
            {
              pieId: "xx2",
              weightage: 60,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 6000,
              pieDetails: {
                name: "Meme Pie 2",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ADA.png",
                    title: "ADA",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/SOL.png",
                    title: "SOL",
                    weightage: 40,
                  },
                ],
              },
              bookProfitValue: 0,
            },
            {
              pieId: "xx3",
              weightage: 10,
              assetsCount: 3,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1000,
              pieDetails: {
                name: "Meme Pie 3",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 15,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ADA.png",
                    title: "ADA",
                    weightage: 10,
                  },
                ],
              },
              bookProfitValue: 0,
            },
            {
              pieId: "xx4",
              weightage: 10,
              assetsCount: 2,
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
              pieValue: 1000,
              pieDetails: {
                name: "Meme Pie 4",
                piesData: [
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/ETH.png",
                    title: "ETH",
                    weightage: 15,
                  },
                  {
                    color: "ffffff",
                    image: "https://images.mudrex.com/BNB.png",
                    title: "BNB",
                    weightage: 10,
                  },
                ],
              },
              bookProfitValue: 0,
            },
          ],
        })
      }
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}
//comman functions
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
const randColor = () => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  )
}

const pieReturnsData = async (coinPie: any) => {
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

const coinReturnsData = async (key: any) => {
  let coinReturns
  let pieYearReturn = 0
  let pieHalfyearReturn = 0
  let pieQuaterReturn = 0
  let pieMonthReturn = 0
  let pieWeekReturn = 0
  let pieDayReturn = 0

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
    ((yearData[yearData.length - 2][1] - yearData[184][1]) / yearData[184][1]) *
    100 *
    key.weightage

  let quaterlyDiffrence =
    ((yearData[yearData.length - 2][1] - yearData[275][1]) / yearData[275][1]) *
    100 *
    key.weightage

  let monthlyDiffrence =
    ((yearData[yearData.length - 2][1] - yearData[334][1]) / yearData[334][1]) *
    100 *
    key.weightage
  let weeklyDiffrence =
    ((yearData[yearData.length - 2][1] - yearData[357][1]) / yearData[357][1]) *
    100 *
    key.weightage

  let dailyDiffrence =
    ((yearData[yearData.length - 2][1] - yearData[364][1]) / yearData[364][1]) *
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
  return coinReturns
}

const graph = async (data: any, days: number) => {
  let graphDataArray: any = []
  let keyArray: any = []
  let timeStamp: any = []
  let value: any = []
  let amount = 1000
  let totalPercentage: number = 0
  await Promise.all(
    await data.map(async (e: any) => {
      let newPriceData = await coinData(e.coinPie)
      newPriceData.map(async (key: any) => {
        totalPercentage = totalPercentage + key.percentage
      })
    })
  )
  await Promise.all(
    await data.map(async (e: any) => {
      let newPriceData = await coinData(e.coinPie)
      newPriceData.map(async (key: any) => {
        key.percentage = (key.percentage / totalPercentage) * 100
        await keyArray.push(key)
      })
    })
  )
  await Promise.all(
    keyArray.map(async (key: any, i: number) => {
      let data: any = await CoinGeckoClient.coins.fetchMarketChart(key.id, {
        days: days,
      })
      await graphDataArray.push({ name: key.id, data: data.data.prices })
      key["tempCoinCount"] = (10 * key.percentage) / data.data.prices[0][1] //((amount * key.percentage) /100)/ data.data.prices[0][1]
    })
  )

  for (let i = 0; i < graphDataArray[0].data.length - 1; i++) {
    await timeStamp.push(graphDataArray[0].data[i][0])
  }
  for (let i = 0; i < graphDataArray.length; i++) {
    const mapper = new Map(graphDataArray[i].data)
    let x = Array.from(mapper.values())
    let multiply = keyArray.filter((e: any) => {
      if (e.id == graphDataArray[i].name) {
        return e.tempCoinCount
      }
    })
    var b = x.map((y: any) => y * multiply[0].tempCoinCount)
    value.push(b)
  }
  let [first, ...rest] = value
  let res = first.map((e: any, i: any) =>
    rest.reduce((sum: any, x: any) => sum + x[i], e)
  )

  return { timestamps: timeStamp, values: res }
}
