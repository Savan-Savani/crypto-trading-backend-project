import express, { Express, Request, Response } from "express"
import bodyParser from "body-parser"
import helmet from "helmet"
import dotenv from "dotenv"
let mongoose = require("mongoose")
import dbConfig from "./config/db"
import cors from "cors"
import authenticationRouters from "./routes/authenticationRoutes"
import coinPiesRoutes from "./routes/coinpiesRoute"
import transactionRoutes from "./routes/transactionRoutes"
import dashboardRoutes from "./routes/dashboardRoutes"
import piefolioRoutes from "./routes/piefolioRoutes"
import pieSetsRoutes from "./routes/pieSetsRoutes"
import referralRoutes from "./routes/referralRoutes"
import walletRoutes from "./routes/walletRoutes"
import exchangeRoutes from "./routes/exchangeRoutes"
import { deleteUserController } from "./controllers/deleteUserController"
import { coin_listController } from "./controllers/coin_listController"
dotenv.config()

import { createServer } from "http"
import { Server } from "socket.io"
import {
  latestExecutionsHandler,
  ordersBookHandler,
} from "./controllers/websocket"

mongoose.connect(
  dbConfig.db,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err: string) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.")
    } else {
      console.log("Error in DB connection : " + err)
    }
  }
)

const PORT = process.env.PORT || 8080
const app: Express = express()

app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/auth", authenticationRouters)
app.use("/pie", coinPiesRoutes)
app.use("/transaction", transactionRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/piefolio", piefolioRoutes)
app.use("/pie-sets", pieSetsRoutes)
app.use("/referral", referralRoutes)
app.use("/wallet", walletRoutes)
app.use("/exchange", exchangeRoutes)

app.delete("/delete-User", deleteUserController)
app.get("/market/coin-list", coin_listController)

app.get("/", (req: Request, res: Response) => {
  res.status(202).send("Backend is working properly")
})

// app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`))

const httpServer = createServer(app)
const webSocketServer = new Server(httpServer)

webSocketServer.on("connection", (socket) => {
  console.log("connected")
  ordersBookHandler(webSocketServer, socket)
  latestExecutionsHandler(webSocketServer, socket)
})
httpServer.listen(PORT, () => {
  console.log(`listening on PORT ${PORT}`)
})
