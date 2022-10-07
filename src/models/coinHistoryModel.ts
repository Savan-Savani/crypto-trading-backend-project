import { model, Schema } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    userId: { type: String },
    coin: { type: String },
    symbol: { type: String },
    action: { type: String },
    amount: { type: Number },
    pricePerCoin: { type: Number },
    count: { type: Number },
  },
  { timestamps: true }
)

export const CoinHistory = model("CoinHistory", UserSchema)
