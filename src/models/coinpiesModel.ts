import { model, Schema } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    userId: { type: String },
    pieName: { type: String },
    description: { type: String },
    coinPies: {
      type: [
        {
          icon: { type: String },
          name: { type: String },
          id: { type: String },
          percentage: { type: Number },
        },
      ],
    },
  },
  { timestamps: true }
)

export const CoinPies = model("CoinPies", UserSchema)
