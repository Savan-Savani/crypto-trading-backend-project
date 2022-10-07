import { model, Schema } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    userId: { type: String },
    coin: { type: String },
    socketId: { type: String },
  },
  { timestamps: true }
)

export const LatestExecutions = model("LatestExecutions", UserSchema)
