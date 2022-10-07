import { model, Schema } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    userId: { type: String },
    action: { type: String }, // "Fund Added","Fund Withdraw","Buy Coinpies","Sell Coinpies"
    amount: { type: Number },
    actionCode: { type: String },
    actionData: {
      type: {
        pieName: { type: String },
        coinPie: {
          type: [
            {
              id: { type: String },
              name: { type: String },
              icon: { type: String },
              count: { type: Number },
              percentage: { type: Number },
              pricePerCoin: { type: Number },
            },
          ],
        },
      },
    },
  },
  { timestamps: true }
)

export const TransactionHistory = model("TransactionHistory", UserSchema)
