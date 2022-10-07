import { model, Schema, Model, Document } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    email: { type: String, unique: true },
    metamaskAddress: { type: String },
    password: { type: String },
    resource: { type: String },
    username: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    type: { type: String }, //"google","email/Password"
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isTwoFactorAuth: { type: Boolean, default: false },
    is2FAEnable: { type: Boolean, default: false },
    phoneCode: { type: String },
    phoneNumber: { type: Number },
    agreement: { type: Boolean },
    referData: {
      type: {
        referralCode: { type: String },
        offerExpire: { type: Date },
        referById: { type: String },
        isUsed: { type: Boolean },
        _id: false,
      },
    },
    otp: { type: Number, default: 0 },
    emailOtp: { type: Number, default: 0 },
    secret: { type: String },
    funds: { type: Number, default: 500 },
    checkmobiId: { type: String },
  },
  { timestamps: true }
)

export const User = model("User", UserSchema)
