interface IUser {
  email: string
  username: string
  password: string
  type: string
  _id: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  otp: number
  resource: string
  secret: string
  funds: number
  phoneNumber: string
  isTwoFactorAuth: boolean
  emailOtp: Number
  is2FAEnable: boolean
  checkmobiId: String
  firstName: String
  lastName: String
  phoneCode: String
}

interface IUserPie {
  buyerId: String
  pieId: String
  pieName: String
  pieAmount: number
  status: Boolean
  bookProfit: number
  isBookProfit: Boolean
  coinPie: IPieDetails[]
  _id: string
}

interface IPieDetails {
  name: String
  id: String
  count: number
  percentage: number
  pricePerCoin: number
  bookProfit: number
  isBookProfit: Boolean
  currentPrice: number
  currentPieAmount: number
  _id: string
}
