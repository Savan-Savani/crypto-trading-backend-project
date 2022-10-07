import express from "express"
const router = express.Router()

import {
  addReferCodeController,
  addUsernameController,
  enableGoogleAuthController,
  forgetGoogleAuthController,
  forgotPasswordController,
  getUserDataController,
  googleRegisterController,
  initiate_callController,
  loginController,
  metamaskRegisterController,
  phoneOTPSMSSendController,
  preLoginController,
  registerController,
  resetPasswordController,
  reset_PasswordController,
  reset_Password_OtpController,
  verifyGoogleAuthController,
  verifyOtpController,
} from "../controllers/authenticationController"

router.post("/register", registerController)
router.post("/pre-login", preLoginController)
router.post("/login", loginController)
router.post("/register/verify-Otp", verifyOtpController)
router.post("/reset-password", reset_Password_OtpController)
router.post("/reset-password/reset", reset_PasswordController)
router.post("/otp-call", initiate_callController)

router.get("/getUserData", getUserDataController)
router.post("/forgotPassword", forgotPasswordController)
router.post("/resetPassword", resetPasswordController)
router.post("/addUsername", addUsernameController)
router.post("/addReferCode", addReferCodeController)
router.post("/enableGoogleAuth", enableGoogleAuthController)
router.post("/verifyGoogleAuth", verifyGoogleAuthController)
router.post("/forgetGoogleAuth", forgetGoogleAuthController)
router.post("/phoneOTPSMSSend", phoneOTPSMSSendController)

router.post("/social-auth/google", googleRegisterController)
router.post("/social-auth/metamask", metamaskRegisterController)

export default router
