import { CoinHistory } from "./../models/coinHistoryModel"
import { LatestExecutions } from "./../models/latestExecutionsModel"
import { ValidToken } from "./../config/commonFunction"
import { Server, Socket } from "socket.io"
import _ from "lodash"
import { OrdersBook } from "../models/ordersBookModel"

const ordersBookMethods = {
  list: "ordersBook:list",
  listUpdated: "ordersBook:listUpdated",
}
let interval: NodeJS.Timer
const UPDATE_INTERVAL = 10000 /* ms */

export const ordersBookHandler = async (
  webSocketServer: Server,
  socket: Socket
) => {
  const socketId = socket.id

  const listOrders = async (payload: any) => {
    if (payload) {
      const bearerHeader: any = payload.Authorization
      const tokenData = await ValidToken(bearerHeader)
      if (tokenData) {
        await OrdersBook.findOne({ userId: tokenData.data.id }).then(
          async (result) => {
            if (result) {
              await OrdersBook.findOneAndUpdate(
                { userId: tokenData.data.id },
                { socketId: socketId, coin: payload.coin }
              )
            } else {
              OrdersBook.create({
                userId: tokenData.data.id,
                coin: payload.coin,
                socketId: socketId,
              })
            }
          }
        )
      }
    }

    if (interval) clearInterval(interval)
    interval = setInterval(async () => {
      await OrdersBook.find().then(async (result: any) => {
        if (result.length !== 0) {
          result.map(async (key: any) => {
            let order = await OrderBookData(key.coin)
            webSocketServer
              .to(key.socketId)
              .emit(ordersBookMethods.listUpdated, order)
          })
        }
      })
      /* Emit this if Data is updated Or Polling to source API */
    }, UPDATE_INTERVAL)
  }
  socket.on("ordersBook:list", listOrders)
  socket.on("disconnect", async () => {
    await OrdersBook.deleteOne({ socketId: socketId })
    if (interval) clearInterval(interval)
    interval = setInterval(async () => {
      await OrdersBook.find().then(async (result) => {
        if (result.length !== 0) {
          result.map(async (key) => {
            let order = await OrderBookData(key.coin)
            webSocketServer
              .to(key.socketId)
              .emit(ordersBookMethods.listUpdated, order)
          })
        } else {
          clearInterval(interval)
        }
      })

      /* Emit this if Data is updated Or Polling to source API */
    }, UPDATE_INTERVAL)
  })
}

const latestExecutionsMethods = {
  list: "latestExecutions:list",
  listUpdated: "latestExecutions:listUpdated",
}
export const latestExecutionsHandler = (
  webSocketServer: Server,
  socket: Socket
) => {
  const socketId = socket.id
  const listOrders = async (payload: any) => {
    if (payload) {
      const bearerHeader: any = payload.Authorization
      const tokenData = await ValidToken(bearerHeader)
      if (tokenData) {
        await LatestExecutions.findOne({ userId: tokenData.data.id }).then(
          async (result) => {
            if (result) {
              await LatestExecutions.findOneAndUpdate(
                { userId: tokenData.data.id },
                { socketId: socketId, coin: payload.coin }
              )
            } else {
              LatestExecutions.create({
                userId: tokenData.data.id,
                coin: payload.coin,
                socketId: socketId,
              })
            }
          }
        )
      }
    }
    if (interval) clearInterval(interval)
    interval = setInterval(async () => {
      await LatestExecutions.find().then(async (result) => {
        if (result.length !== 0) {
          result.map(async (key) => {
            let Trade = await recentTrade(key.coin)
            /* Emit this if Data is updated Or Polling to source API */
            webSocketServer
              .to(key.socketId)
              .emit(latestExecutionsMethods.listUpdated, Trade)
          })
        }
      })
    }, UPDATE_INTERVAL)
  }
  socket.on(latestExecutionsMethods.list, listOrders)
  socket.on("disconnect", async () => {
    await LatestExecutions.deleteOne({ socketId: socketId })
    if (interval) clearInterval(interval)
    interval = setInterval(async () => {
      await LatestExecutions.find().then(async (result) => {
        if (result.length !== 0) {
          result.map(async (key) => {
            let Trade = await recentTrade(key.coin)
            /* Emit this if Data is updated Or Polling to source API */
            webSocketServer
              .to(key.socketId)
              .emit(latestExecutionsMethods.listUpdated, Trade)
          })
        } else {
          clearInterval(interval)
        }
      })

      /* Emit this if Data is updated Or Polling to source API */
    }, UPDATE_INTERVAL)
  })
}

const recentTrade = async (coin: any) => {
  let dataArray: any = []

  await CoinHistory.find({ symbol: coin }).then(async (result) => {
    if (result.length !== 0) {
      result.map(async (key) => {
        // let time = Stringify(key.createdAt)
        let data = JSON.stringify(key.createdAt).split("T")
        let time = data[1].split(".")
        await dataArray.push({
          time: time[0],
          executedPrice: {
            value: key.pricePerCoin,
            isPositive: "True",
          },
          volume: key.count,
        })
      })
    }
  })
  let d = { tradingPair: coin.split("/"), tableBodyData: dataArray }
  return d
}

const OrderBookData = async (coin: any) => {
  let sellOrders: any = []
  let buyOrders: any = []
  await CoinHistory.find({ symbol: coin }).then((result) => {
    if (result.length !== 0) {
      result.reverse()
      result.map((key: any) => {
        if (key.action == "Buy") {
          buyOrders.push({
            price: key.pricePerCoin,
            amount: key.count,
            total: key.amount,
            weightage: 40,
          })
        } else {
          sellOrders.push({
            price: key.pricePerCoin,
            amount: key.count,
            total: key.amount,
            weightage: 40,
          })
        }
      })
    }
  })

  let data = {
    tradingPair: coin.split("/"),
    sellOrders: {
      data: sellOrders.slice(0, 2),
    },
    buyOrders: {
      data: buyOrders.slice(0, 2),
    },
  }

  return data
}
