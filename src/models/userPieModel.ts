import { model, Schema } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    buyerId: { type: String },
    pieId: { type: String },
    pieName: { type: String },
    description: { type: String },
    pieAmount: { type: Number },
    status: { type: Boolean, default: true },
    bookProfit: { type: Number },
    isBookProfit: { type: Boolean },
    coinPie: {
      type: [
        {
          name: { type: String },
          id: { type: String },
          icon: { type: String },
          count: { type: Number },
          percentage: { type: Number },
          pricePerCoin: { type: Number },
          bookProfit: { type: Number },
          isBookProfit: { type: Boolean },
        },
      ],
    },
  },
  { timestamps: true }
)

export const UserPie = model("UserPie", UserSchema)
