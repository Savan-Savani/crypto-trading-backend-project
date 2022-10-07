import { UserPie } from "./../models/userPieModel"
import { Request, Response } from "express"
import { ValidToken } from "../config/commonFunction"
import CoinGecko from "coingecko-api"
import _ from "lodash"
const CoinGeckoClient: any = new CoinGecko()

export const pieSetsController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { category, coins, monthlyFees, search, sortBy, limit, offset }: any =
      req.query
    let dataArray: any = []
    let coinUpdatedData
    let days = req.body.days || 7
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.find({ buyerId: tokenData.data.id })
        .then(async (result) => {
          let filterdata = result.filter(
            (e: IUserPie) => e.status == true && e.coinPie.length != 0
          )
          if (filterdata.length !== 0) {
            for (let i = 0; i < filterdata.length; i++) {
              let data = JSON.parse(JSON.stringify(filterdata[i].coinPie))
              coinUpdatedData = await coinData(data)

              let coinReturnsData: any = await returnsData(coinUpdatedData)
              let pieReturns = JSON.parse(JSON.stringify(coinReturnsData))
              let perforamanceGraphData = await graph(coinUpdatedData, days)
              let convertedCoins = await Promise.all(
                _.map(coinUpdatedData, (e) => ({
                  color: randColor(),
                  image: e.image,
                  title: e.title,
                  weightage: e.weightage,
                }))
              )

              await dataArray.push({
                id: filterdata[i].id,
                title: filterdata[i].pieName,
                description: filterdata[i].description,
                originalMonthlyFee: "2%",
                isFree: true,
                investorsCount: filterdata[i].pieAmount,
                returns: {
                  day: (pieReturns.pieDayReturn / 100).toFixed(4),
                  week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                  year: (pieReturns.pieYearReturn / 100).toFixed(4),
                  halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                  quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                  month: (pieReturns.pieMonthReturn / 100).toFixed(4),
                },
                piesData: convertedCoins,
                graphData: perforamanceGraphData,
              })
            }
            console.log("if data");
            
            res.status(200).send({
              currency: JSON.parse("$"),
              currencyName: JSON.parse("USD"),
              totalPages: 15,
              data: JSON.parse(dataArray),
            })
          } else {
            //mock data 
            // res.status(404).send({
            //   error_message: "empty piefolio",
            // })
            console.log("data");
            
            res.status(200).send({
              currency: "$",
              currencyName: "USD",
              totalPages: 15,
              data: [
                {
                  id: "xx1",
                  title: "New Crypto Stars",
                  description:
                    "10 of the most promising tokens weighed by market cap",
                  originalMonthlyFee: "2%",
                  isFree: true,
                  investorsCount: 3000,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
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
                  graphData: {
                    timestamps: [
                      1613658240, 1614707580, 1615762320, 1616811660,
                      1617861000, 1618919340, 1619985720, 1621035060,
                      1622084400, 1623133740, 1624183080, 1625232420,
                      1626281760, 1627331100, 1628380440, 1629445980,
                      1630495320, 1631544660, 1632594000, 1633650540,
                      1634699880, 1635749220, 1636798560, 1637847900,
                      1638897240, 1639946580, 1640995920, 1642045260,
                      1643094600, 1644143940, 1645193280,
                    ],
                    returns: [
                      0, -4.86, 14.34, 6.27, 25.55, 34.17, 63.36, 76.21, 23.05,
                      15.85, 10.42, 3.97, 2.03, 10.59, 41.74, 70.56, 107.75,
                      116.78, 97.73, 132.82, 149.24, 182.79, 207.93, 190.02,
                      168.53, 144.7, 134.11, 110.97, 45.03, 80.5, 64.67,
                    ],
                  },
                },
                {
                  id: "xx2",
                  title: "MetVerse",
                  description:
                    "10 of the most promising tokens weighed by market  cap",
                  originalMonthlyFee: "2%",
                  isFree: true,
                  investorsCount: 2000,
                  returns: {
                    day: 10,
                    week: 10,
                    year: 80,
                    halfYear: 50,
                    quarterYear: 10,
                    month: 0,
                  },
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
                  graphData: {
                    timestamps: [
                      1613658240, 1614707580, 1615762320, 1616811660,
                      1617861000, 1618919340, 1619985720, 1621035060,
                      1622084400, 1623133740, 1624183080, 1625232420,
                      1626281760, 1627331100, 1628380440, 1629445980,
                      1630495320, 1631544660, 1632594000, 1633650540,
                      1634699880, 1635749220, 1636798560, 1637847900,
                      1638897240, 1639946580, 1640995920, 1642045260,
                      1643094600, 1644143940, 1645193280,
                    ],
                    returns: [
                      0, -4.86, 14.34, 6.27, 25.55, 34.17, 63.36, 76.21, 23.05,
                      15.85, 10.42, 3.97, 2.03, 10.59, 41.74, 70.56, 107.75,
                      116.78, 97.73, 132.82, 149.24, 182.79, 207.93, 190.02,
                      168.53, 144.7, 134.11, 110.97, 45.03, 80.5, 64.67,
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
  } catch (err: any) {
    res.status(404).send({ error_message: err.message })
  }
}

export const pieSetsIDController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { id } = req.params
    let coinUpdatedData
    let days = req.body.days || 7
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.find({ _id: id }).then(async (result) => {
        let filterdata = result.filter(
          (e: IUserPie) => e.status == true && e.coinPie.length != 0
        )
        if (filterdata.length !== 0) {
          let data = JSON.parse(JSON.stringify(filterdata[0].coinPie))
          coinUpdatedData = await coinData(data)
          let coinReturnsData: any = await returnsData(coinUpdatedData)
          let pieReturns = JSON.parse(JSON.stringify(coinReturnsData))
          let perforamanceGraphData = await graph(coinUpdatedData, days)

          let convertedCoins = _.map(coinUpdatedData, (e) => ({
            color: randColor(),
            image: e.image,
            title: e.title,
            weightage: e.weightage,
          }))

          res.status(200).send({
            currency: "$",
            currencyName: "USD",
            data: {
              id: id,
              title: filterdata[0].pieName,
              subtitle: filterdata[0].pieName.toUpperCase(),
              description: filterdata[0].description,
              minInvestment: 200,
              investorsCount: filterdata[0].pieAmount,
              isFree: true,
              originalMonthlyFee: "2%",
              coinsData: convertedCoins,
              supportedExchanges: [
                {
                  image: "https://senpie.com/assets/exchange-icons/binance.png",
                  title: "Binance",
                },
                {
                  image: "https://senpie.com/assets/exchange-icons/binance.png",
                  title: "Senpie",
                },
                {
                  image: "https://senpie.com/assets/exchange-icons/binance.png",
                  title: "Third",
                },
                {
                  image: "https://senpie.com/assets/exchange-icons/binance.png",
                  title: "Forth",
                },
                {
                  image: "https://senpie.com/assets/exchange-icons/binance.png",
                  title: "Fifth",
                },
                {
                  image: "https://senpie.com/assets/exchange-icons/binance.png",
                  title: "Sixth",
                },
              ],
              returns: {
                day: (pieReturns.pieDayReturn / 100).toFixed(4),
                week: (pieReturns.pieWeekReturn / 100).toFixed(4),
                year: (pieReturns.pieYearReturn / 100).toFixed(4),
                halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
                quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
                month: (pieReturns.pieMonthReturn / 100).toFixed(4),
              },
              piesData: convertedCoins,
              graphData: perforamanceGraphData,
            },
          })
        } else {
          //mock data
          // res.status(404).send({
          //   error_message: "empty piefolio",
          // })
          res.status(200).send({
            currency: "$",
            currencyName: "USD",
            data: {
              id: "xxx1",
              title: "Crypto Blue Chip",
              subtitle: "Top 5 Crypto assets weighed by market cap",
              description:
                "A coin set composed of the most well recognized and reputed crypto tokens, Crypto Blue Chip coin set offers steady, longterm returns and is a safer bet in the market as it combines high market cap tokens, which are less prone to volatility and have a proven  track record. The five constituent tokens are Bitcoin(BTC), Ethereum (ETH)",
              minInvestment: 200,
              investorsCount: 3000,
              isFree: true,
              originalMonthlyFee: "2%",
              coinsData: [
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
              supportedExchanges: [
                {
                  image: "https://mudrex.com/assets/exchange-icons/binance.png",
                  title: "Binance",
                },
                {
                  image: "https://mudrex.com/assets/exchange-icons/binance.png",
                  title: "Mudrex",
                },
                {
                  image: "https://mudrex.com/assets/exchange-icons/binance.png",
                  title: "Third",
                },
                {
                  image: "https://mudrex.com/assets/exchange-icons/binance.png",
                  title: "Forth",
                },
                {
                  image: "https://mudrex.com/assets/exchange-icons/binance.png",
                  title: "Fifth",
                },
                {
                  image: "https://mudrex.com/assets/exchange-icons/binance.png",
                  title: "Sixth",
                },
              ],
              returns: {
                day: 10,
                week: 10,
                year: 80,
                halfYear: 50,
                quarterYear: 10,
                month: 0,
              },
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
              graphData: {
                timestamps: [
                  1613658240, 1614707580, 1615762320, 1616811660, 1617861000,
                  1618919340, 1619985720, 1621035060, 1622084400, 1623133740,
                  1624183080, 1625232420, 1626281760, 1627331100, 1628380440,
                  1629445980, 1630495320, 1631544660, 1632594000, 1633650540,
                  1634699880, 1635749220, 1636798560, 1637847900, 1638897240,
                  1639946580, 1640995920, 1642045260, 1643094600, 1644143940,
                  1645193280,
                ],
                returns: [
                  0, -4.86, 14.34, 6.27, 25.55, 34.17, 63.36, 76.21, 23.05,
                  15.85, 10.42, 3.97, 2.03, 10.59, 41.74, 70.56, 107.75, 116.78,
                  97.73, 132.82, 149.24, 182.79, 207.93, 190.02, 168.53, 144.7,
                  134.11, 110.97, 45.03, 80.5, 64.67,
                ],
              },
            },
          })
        }
      })
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}
export const constituentsIDController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { id } = req.params
    let coinUpdatedData
    let dataArray: any = []

    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({ _id: id }).then(async (result) => {
        if (result.length !== 0) {
          let data = JSON.parse(JSON.stringify(result.coinPie))
          coinUpdatedData = await coinData(data)
          await Promise.all(
            coinUpdatedData.map(async (key: any, i: number) => {
              let coinReturn: any = await coinReturnsData(key)

              await dataArray.push({
                id: key._id,
                image: key.image,
                name: {
                  title: key.name,
                  subtitle: key.title,
                },
                weightage: key.weightage,
                returns: {
                  day: (coinReturn.pieDayReturn / 100).toFixed(4),
                  week: (coinReturn.pieWeekReturn / 100).toFixed(4),
                  year: (coinReturn.pieYearReturn / 100).toFixed(4),
                  halfYear: (coinReturn.pieHalfyearReturn / 100).toFixed(4),
                  quarterYear: (coinReturn.pieQuaterReturn / 100).toFixed(4),
                  month: (coinReturn.pieMonthReturn / 100).toFixed(4),
                },
              })
            })
          )
          res.status(200).send({
            currency: "$",
            currencyName: "USD",
            id: id,
            title: result.pieName,
            tableBodyData: dataArray,
          })
        } else {
          //mock data
          // res.status(404).send({
          //   error_message: "empty piefolio",
          // })
          res.status(200).send({
            currency: "$",
            currencyName: "USD",
            id: "xx1",
            title: "Crypto Blue Chip Constituents",
            tableBodyData: [
              {
                id: "xxx1",
                image: "https://images.mudrex.com/BTC.png",
                name: {
                  title: "BitCoin",
                  subtitle: "BTC",
                },
                weightage: 20,
                returns: {
                  day: 10,
                  week: 10,
                  year: 80,
                  halfYear: 50,
                  quarterYear: 10,
                  month: 0,
                },
              },
              {
                id: "xxx2",
                image: "https://images.mudrex.com/ETH.png",
                name: {
                  title: "Ethereum",
                  subtitle: "ETH",
                },
                weightage: 40,
                returns: {
                  day: 10,
                  week: 10,
                  year: 80,
                  halfYear: 50,
                  quarterYear: 10,
                  month: 0,
                },
              },
              {
                id: "xxx3",
                image: "https://images.mudrex.com/BNB.png",
                name: {
                  title: "BNB",
                  subtitle: "BNB",
                },
                weightage: 30,
                returns: {
                  day: 10,
                  week: 10,
                  year: 80,
                  halfYear: 50,
                  quarterYear: 10,
                  month: 0,
                },
              },
            ],
          })
        }
      })
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}
export const performance_graphIDController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { id } = req.params
    let { graphType, returnsPeriod } = req.query
    let coinUpdatedData
    let days = req.body.days || 7
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({ _id: id }).then(async (result) => {
        if (result.length !== 0) {
          let data = JSON.parse(JSON.stringify(result.coinPie))
          coinUpdatedData = await coinData(data)
          let coinReturnsData: any = await returnsData(coinUpdatedData)
          let pieReturns = JSON.parse(JSON.stringify(coinReturnsData))
          let perforamanceGraphData = await coinGraph(coinUpdatedData, days)

          res.status(200).send({
            returns: {
              day: (pieReturns.pieDayReturn / 100).toFixed(4),
              week: (pieReturns.pieWeekReturn / 100).toFixed(4),
              year: (pieReturns.pieYearReturn / 100).toFixed(4),
              halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
              quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
              month: (pieReturns.pieMonthReturn / 100).toFixed(4),
            },
            perforamanceData: perforamanceGraphData,
          })
        } else {
          //MOCK DATA
          // res.status(404).send({
          //   error_message: "empty piefolio",
          // })
          res.status(200).send({
            returns: {
              day: 10,
              week: 10,
              year: 80,
              halfYear: 50,
              quarterYear: 10,
              month: 0,
            },
            perforamanceData: {
              timestamps: [
                1613658240, 1614707580, 1615762320, 1616811660, 1617861000,
                1618919340, 1619985720, 1621035060, 1622084400, 1623133740,
                1624183080, 1625232420, 1626281760, 1627331100, 1628380440,
                1629445980, 1630495320, 1631544660, 1632594000, 1633650540,
                1634699880, 1635749220, 1636798560, 1637847900, 1638897240,
                1639946580, 1640995920, 1642045260, 1643094600, 1644143940,
                1645193280,
              ],
              linesData: [
                {
                  title: "Crypto Blue chip",
                  returns: [
                    962.948, 865.061, 150.257, 607.613, 282.462, 501.331,
                    263.551, 401.453, 764.18, 922.567, 496.358, 855.638,
                    398.352, 942.874, 356.972, 845.601, 557.631, 291.39,
                    701.216, 643.596, 270.836, 271.213, 426.701, 931.423,
                    362.544, 857.79, 72.209, 142.792, 375.069, 960.891, 968.58,
                    128.459, 629.141,
                  ],
                },
                {
                  title: "BTC",
                  returns: [
                    45.505, 532.819, 518.453, 979.717, 586.974, 552.181, 120.65,
                    392.059, 157.61, 381.818, 470.538, 568.069, 110.576,
                    970.941, 194.786, 818.066, 66.923, 127.218, 778.277,
                    205.543, 575.192, 593.804, 151.389, 330.401, 467.433,
                    219.085, 766.153, 295.717, 282.447, 151.765, 534.28,
                    596.689, 981.743,
                  ],
                },
                {
                  title: "Third Crypto",
                  returns: [
                    323.763, 744.179, 229.298, 519.233, 65.313, 723.007,
                    952.353, 396.306, 994.398, 759.726, 232.613, 37.29, 668.958,
                    933.406, 680.541, 43.942, 256.894, 534.83, 213.257, 41.932,
                    652.908, 90.279, 221.971, 369.861, 751.745, 116.188, 621.25,
                    971.551, 759.755, 431.773, 222.015, 267.818, 66.544,
                  ],
                },
              ],
            },
          })
        }
      })
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}
export const returnsIDController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { id } = req.params
    let coinUpdatedData
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      UserPie.findOne({ _id: id }).then(async (result) => {
        if (result.length !== 0) {
          let data = JSON.parse(JSON.stringify(result.coinPie))
          coinUpdatedData = await coinData(data)
          let coinReturnsData: any = await returnsData(coinUpdatedData)
          let pieReturns = JSON.parse(JSON.stringify(coinReturnsData))

          res.status(200).send({
            returns: {
              day: (pieReturns.pieDayReturn / 100).toFixed(4),
              week: (pieReturns.pieWeekReturn / 100).toFixed(4),
              year: (pieReturns.pieYearReturn / 100).toFixed(4),
              halfYear: (pieReturns.pieHalfyearReturn / 100).toFixed(4),
              quarterYear: (pieReturns.pieQuaterReturn / 100).toFixed(4),
              month: (pieReturns.pieMonthReturn / 100).toFixed(4),
            },
            minInvestment: 1000,
            maxInvestment: 9000,
          })
        } else {
          //mock data
          // res.status(404).send({
          //   error_message: "empty piefolio",
          // })
          res.status(200).send({
            returns: {
              day: 10,
              week: 10,
              year: 80,
              halfYear: 50,
              quarterYear: 10,
              month: 0,
            },
            minInvestment: 1000,
            maxInvestment: 9000,
          })
        }
      })
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}

export const customizeIDController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { id } = req.params
    let coinUpdatedData
    let dataArray: any = []
    if (tokenData) {
      UserPie.findOne({ _id: id }).then(async (result) => {
        if (result.length !== 0) {
          let data = JSON.parse(JSON.stringify(result.coinPie))
          coinUpdatedData = await coinData(data)
          await Promise.all(
            coinUpdatedData.map(async (key: any, i: number) => {
              let coinReturn: any = await coinReturnsData(key)

              await dataArray.push({
                id: key._id,
                image: key.image,
                name: {
                  title: key.name,
                  subtitle: key.title,
                },
                color: randColor(),
                weightage: key.weightage,
                returns: {
                  day: (coinReturn.pieDayReturn / 100).toFixed(4),
                  week: (coinReturn.pieWeekReturn / 100).toFixed(4),
                  year: (coinReturn.pieYearReturn / 100).toFixed(4),
                  halfYear: (coinReturn.pieHalfyearReturn / 100).toFixed(4),
                  quarterYear: (coinReturn.pieQuaterReturn / 100).toFixed(4),
                  month: (coinReturn.pieMonthReturn / 100).toFixed(4),
                },
              })
            })
          )
          res.status(200).send({
            piesData: dataArray,
          })
        } else {
          //mock data
          // res.status(404).send({
          //   error_message: "empty piefolio",
          // })
          res.status(200).send({
            piesData: [
              {
                id: "xxx1",
                image: "https://images.mudrex.com/BTC.png",
                name: {
                  title: "BitCoin",
                  subtitle: "BTC",
                },
                color: "#ffff",
                weightage: 18,
                returns: {
                  day: 10,
                  week: 10,
                  year: 80,
                  halfYear: 50,
                  quarterYear: 10,
                  month: 0,
                },
              },
              {
                id: "xxx2",
                image: "https://images.mudrex.com/ETH.png",
                name: {
                  title: "Ethereum",
                  subtitle: "ETH",
                },
                color: "#ffff",
                weightage: 46,
                returns: {
                  day: 10,
                  week: 10,
                  year: 80,
                  halfYear: 50,
                  quarterYear: 10,
                  month: 0,
                },
              },
              {
                id: "xxx3",
                image: "https://images.mudrex.com/BNB.png",
                name: {
                  title: "BNB",
                  subtitle: "BNB",
                },
                color: "#ffff",
                weightage: 36,
                returns: {
                  day: 10,
                  week: 10,
                  year: 80,
                  halfYear: 50,
                  quarterYear: 10,
                  month: 0,
                },
              },
            ],
          })
        }
      })
    } else {
      res.status(401)
    }
  } catch (error: any) {
    res.status(404).send({ error_message: error.message })
  }
}

//common functions
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

const randColor = () => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  )
}

//for one pie
const graph = async (data: any, days: number) => {
  let graphDataArray: any = []
  let keyArray: any = []
  let timeStamp: any = []
  let value: any = []
  let amount = 1000

  await Promise.all(
    data.map(async (key: any) => {
      await keyArray.push(key)
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

  return { timestamps: timeStamp, returns: res }
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

//graph for particular coin
const coinGraph = async (data: any, days: number) => {
  let graphDataArray: any = []
  let keyArray: any = []
  let timeStamp: any = []
  let value: any = []
  let amount = 1000

  await Promise.all(
    data.map(async (key: any) => {
      await keyArray.push(key)
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
    value.push({ title: multiply[0].title, returns: b })
  }
  return { timestamps: timeStamp, linesData: value }
}
