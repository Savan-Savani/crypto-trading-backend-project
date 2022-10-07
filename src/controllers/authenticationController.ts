import axios from "axios"
import { Request, Response } from "express"
import { nanoid } from "nanoid"
import moment from "moment"
import { User } from "../models/userModel"
import bcrypt from "bcrypt"
let jwt = require("jsonwebtoken")
import nodemailer from "nodemailer"
import { ValidToken } from "../config/commonFunction"
import { OAuth2Client } from "google-auth-library"
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT)
import speakeasy from "speakeasy"
import qrcode from "qrcode"
require("dotenv").config()
const mailgun = require("mailgun-js")
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
})

let transporter: any = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "getthriftydeveloper@gmail.com",
    pass: "g3TThr!fTyGiTHUB",
  },
})

// let transporter = nodemailer.createTransport({
//   host:"smtp.mailgun.org",
//   port: 587 ,
//   auth: {
//     user: "postmaster@sandbox2475119d1fd54d28b934225d7840b123.mailgun.org",
//     pass: "59d2d72894ea126caf686b6167bdcdb8-38029a9d-383b62ca",
//   },
// })

export const getUserDataController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      User.findOne({ email: tokenData.data.email })
        .then((result: IUser) => {
          let data = JSON.parse(JSON.stringify(result))
          if (data.referData) {
            data.isUserAlreadyRefer = data.referData.referById !== ""
            data.isReferOffer = moment() < moment(data.referData.offerExpire)
          }
          res.status(200).send({
            data: data,
          })
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const addReferCodeController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      User.findOneAndUpdate(
        { email: tokenData.data.email },
        { "referData.referById": req.body.referralCode }
      )
        .then(async (result: IUser) => {
          if (result) {
            res.status(200).send({
              message: "refer code applied successfully",
            })
          }
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const registerController = async (req: Request, res: Response) => {
  try {
    let { username, password, referralCode, phoneCode, agreement } = req.body
    let email = req.body.email || "email"
    let phoneNumber = req.body.phoneNumber || 1234567890
    if (email) {
      email = email.toLowerCase()
    }
    let referObject
    let emailOtp = Math.floor(100000 + Math.random() * 900000)
    User.findOne({
      $or: [
        { email: email },
        { phoneNumber: phoneNumber },
        { username: username },
      ],
    })
      .then(async (Data: IUser) => {
        if (Data) {
          if (email == Data.email) {
            //email not found
            res.status(400).send({
              error_message: "Email already exist",
            })
          } else if (Data.phoneNumber == phoneNumber) {
            res.status(400).send({
              error_message: "phone number already exist",
            })
          } else if (Data.username == username) {
            res.status(400).send({
              error_message: "username already exist",
            })
          }
        } else {
          //send OTP and store data
          if (email) {
            let isMailSend = await verifyEmailSend(emailOtp, email)
          }

          let hashPassword = await bcrypt.hash(password, 10)
          referObject = {
            referData: {
              referById: referralCode?.length === 11 ? referralCode : "",
              referralCode: nanoid(11),
              offerExpire: moment().format(),
              isUsed: false,
            },
          }
          if (email !== "email") {
            User.create({
              email,
              username,
              emailOtp,
              password: hashPassword,
              phoneCode,
              phoneNumber: "",
              agreement,
              type: "email/password",
              referData: referObject.referData,
            })
              .then(() => {
                res.status(201).send({
                  message: "Please check your email...",
                })
              })
              .catch((err: Error) => {
                res.status(400).send({
                  error_message: err.message,
                })
              })
          }
          if (phoneNumber !== 1234567890) {
            User.create({
              email: "",
              username,
              emailOtp,
              password: hashPassword,
              phoneCode,
              phoneNumber,
              agreement,
              type: "email/password",
              referData: referObject.referData,
            })
              .then(() => {
                res.status(201).send({
                  message: "Please check your email...",
                })
              })
              .catch((err: Error) => {
                res.status(400).send({
                  error_message: err.message,
                })
              })
          }
        }
      })
      .catch((err: Error) => {
        res.status(400).send({
          error_message: err.message,
        })
      })
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const googleRegisterController = (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]

    let { referralCode } = req.body
    googleAuthentication(bearerHeader, res, referralCode)
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const preLoginController = async (req: Request, res: Response) => {
  try {
    let { email, password, phoneNumber, phoneCode } = req.body
    let emailOtp = Math.floor(100000 + Math.random() * 900000)
    if (email) {
      email = email.toLowerCase()
      User.findOne({ email: email }).then(async (Data: IUser) => {
        if (Data) {
          if (Data.password) {
            let isValidPassword = await bcrypt.compare(password, Data.password)
            if (isValidPassword) {
              if (Data.isTwoFactorAuth) {
                let isMailSend = await verifyEmailSend(emailOtp, email)
                if (isMailSend) {
                  User.findOneAndUpdate(
                    { email: Data.email },
                    { emailOtp: emailOtp }
                  )
                    .then(() => {
                      res.status(200).send({
                        isTwoFactorAuth: Data.isTwoFactorAuth,
                      })
                    })
                    .catch((err: Error) => {
                      res.status(401).send({
                        error_message: err.message,
                      })
                    })
                }
              } else {
                res.status(200).send({
                  isTwoFactorAuth: Data.isTwoFactorAuth,
                })
              }
            } else {
              res.status(401).send({
                error_message: "provide valid password",
              })
            }
          }
        } else {
          res.status(404).send({
            error_message: "user not found",
          })
        }
      })
    } else {
      User.findOne({ phoneNumber: phoneNumber, phoneCode: phoneCode }).then(
        async (Data: IUser) => {
          if (Data) {
            if (Data.password) {
              let isValidPassword = await bcrypt.compare(
                password,
                Data.password
              )
              if (isValidPassword) {
                if (Data.isTwoFactorAuth) {
                  let isMailSend = await verifyEmailSend(emailOtp, email)
                  if (isMailSend) {
                    User.findOneAndUpdate(
                      { email: Data.email },
                      { emailOtp: emailOtp }
                    )
                      .then(() => {
                        res.status(200).send({
                          isTwoFactorAuth: Data.isTwoFactorAuth,
                        })
                      })
                      .catch((err: Error) => {
                        res.status(401).send({
                          error_message: err.message,
                        })
                      })
                  }
                } else {
                  res.status(200).send({
                    isTwoFactorAuth: Data.isTwoFactorAuth,
                  })
                }
              } else {
                res.status(401).send({
                  error_message: "provide valid password",
                })
              }
            }
          } else {
            res.status(404).send({
              error_message: "user not found",
            })
          }
        }
      )
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const loginController = async (req: Request, res: Response) => {
  try {
    let { email, password, otp, phoneNumber, phoneCode } = req.body
    if (email) {
      let validEmail = ValidateEmail(email)
      if (validEmail) {
        email = email.toLowerCase()
        User.findOne({ $or: [{ email: email }, { username: email }] })
          .then(async (Data: IUser) => {
            if (Data) {
              if (Data.password) {
                let isValidPassword = await bcrypt.compare(
                  password,
                  Data.password
                )
                if (isValidPassword) {
                  if (Data.isTwoFactorAuth) {
                    if (Data.emailOtp == otp) {
                      let token = createJwtToken(Data.email, Data._id)
                      res.status(200).send({
                        tokens: {
                          access: token,
                        },
                        username: Data.username,
                        email: Data.email,
                        phoneNumber: Data.phoneNumber || "",
                        phoneCode: Data.phoneCode || "",
                        isEmailVerified: Data.isEmailVerified,
                        isPhoneVerified: Data.isPhoneVerified,
                      })
                    } else {
                      res.status(401).send({
                        error_message: "invalid OTP",
                      })
                    }
                  } else {
                    let token = createJwtToken(Data.email, Data._id)
                    res.status(200).send({
                      tokens: {
                        access: token,
                      },
                      username: Data.username,
                      email: Data.email,
                      phoneNumber: Data.phoneNumber || "",
                      phoneCode: Data.phoneCode || "",
                      isPhoneVerified: Data.isPhoneVerified,
                      isEmailVerified: Data.isEmailVerified,
                    })
                  }
                } else {
                  res.status(401).send({
                    error_message: "Invalid password",
                  })
                }
              } else {
                res.status(400).send({
                  error_message: "Please try with google login",
                })
              }
            } else {
              res.status(401).send({
                error_message: "Please register first",
              })
            }
          })
          .catch((err: Error) => {
            res.status(404).send({
              error_message: err.message,
            })
          })
      }
    } else {
      User.findOne({ phoneNumber: phoneNumber, phoneCode: phoneCode })
        .then(async (Data: IUser) => {
          if (Data) {
            if (Data.password) {
              let isValidPassword = await bcrypt.compare(
                password,
                Data.password
              )
              if (isValidPassword) {
                if (Data.isTwoFactorAuth) {
                  if (Data.emailOtp == otp) {
                    let token = createJwtToken(Data.email, Data._id)
                    res.status(200).send({
                      tokens: {
                        access: token,
                      },
                      username: Data.username,
                      email: Data.email || "",
                      phoneNumber: Data.phoneNumber,
                      phoneCode: Data.phoneCode,
                      isPhoneVerified: Data.isPhoneVerified,
                      isEmailVerified: Data.isEmailVerified,
                    })
                  } else {
                    res.status(401).send({
                      error_message: "invalid OTP",
                    })
                  }
                } else {
                  let token = createJwtToken(Data.email, Data._id)
                  res.status(200).send({
                    tokens: {
                      access: token,
                    },
                    username: Data.username,
                    email: Data.email || "",
                    phoneNumber: Data.phoneNumber,
                    phoneCode: Data.phoneCode,
                    isPhoneVerified: Data.isPhoneVerified,
                    isEmailVerified: Data.isEmailVerified,
                  })
                }
              } else {
                res.status(401).send({
                  error_message: "Invalid password",
                })
              }
            } else {
              res.status(400).send({
                error_message: "Please try with google login",
              })
            }
          } else {
            res.status(401).send({
              error_message: "Please register first",
            })
          }
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const {
      username,
      agreement,
      password,
      referralCode,
      otp,
      phoneCode,
      phoneNumber,
      email,
    } = req.body
    const tokenData = await ValidToken(bearerHeader)
    let updateObject
    if (tokenData) {
      // if (phoneOtp && emailOtp) {
      //   updateObject = {
      //     isPhoneVerified: true,
      //     isEmailVerified: true,
      //     emailOtp: 0,
      //   }
      //   let isPhoneOTPVerified = await verifyMisssedCallPinController(
      //     tokenData.data.email,
      //     phoneOtp
      //   )
      //   if (isPhoneOTPVerified) {
      //     User.findOneAndUpdate(
      //       {
      //         email: tokenData.data.email,
      //         emailOtp: emailOtp,
      //       },
      //       updateObject
      //     )
      //       .then((result: IUser) => {
      //         if (result) {
      //           let token = createJwtToken(result.email, result._id)
      //           res.status(200).send({
      //             tokens: {
      //               access: token,
      //             },
      //             username: result.username,
      //             firstName: result.firstName,
      //             lastName: result.lastName,
      //             email: result.email,
      //             phoneNumber: result.phoneNumber,
      //             phoneCode: result.phoneCode,
      //             isPhoneVerified: true,
      //             isEmailVerified: true,
      //           })
      //         } else {
      //           res.status(401).send({
      //             error_message: "Invalid otp",
      //           })
      //         }
      //       })
      //       .catch((err: Error) => {
      //         res.status(404).send({
      //           error_message: err.message,
      //         })
      //       })
      //     }
      //   } else if (phoneOtp) {
      if (phoneNumber) {
        updateObject = { isPhoneVerified: true }
        let isPhoneOTPVerified = await verifyMisssedCallPinController(
          tokenData.data.email,
          otp
        )
        if (isPhoneOTPVerified) {
          User.findOneAndUpdate({ phoneNumber: phoneNumber }, updateObject)
            .then((result: IUser) => {
              if (result) {
                let token = createJwtToken(result.email, result._id)
                res.status(200).send({
                  tokens: {
                    access: token,
                  },
                  username: result.username,
                  email: result.email || "",
                  phoneNumber: result.phoneNumber,
                  phoneCode: result.phoneCode,
                  isPhoneVerified: true,
                  isEmailVerified: false,
                })
              } else {
                res.status(401).send({
                  error_message: "Invalid otp",
                })
              }
            })
            .catch((err: Error) => {
              res.status(404).send({
                error_message: err.message,
              })
            })
        }
      } else {
        updateObject = {
          isEmailVerified: true,
          emailOtp: 0,
        }
        User.findOneAndUpdate({ email: email, emailOtp: otp }, updateObject)
          .then((result: IUser) => {
            if (result) {
              let token = createJwtToken(result.email, result._id)
              res.status(200).send({
                tokens: {
                  access: token,
                },
                username: result.username,
                email: result.email,
                phoneNumber: result.phoneNumber || "",
                phoneCode: result.phoneCode || "",
                isPhoneVerified: false,
                isEmailVerified: true,
              })
            } else {
              res.status(401).send({
                error_message: "Invalid otp",
              })
            }
          })
          .catch((err: Error) => {
            res.status(404).send({
              error_message: err.message,
            })
          })
      }
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const verifyGoogleAuthController = async (
  req: Request,
  res: Response
) => {
  const bearerHeader: any = req.headers["authorization"]

  let { google2FAcode } = req.body
  const tokenData = await ValidToken(bearerHeader)

  User.findOne({ email: tokenData.data.email })
    .then((result: IUser) => {
      let verified = speakeasy.totp.verify({
        secret: result.secret,
        encoding: "ascii",
        token: google2FAcode,
      })
      if (verified) {
        res.status(200).send({
          message: "google 2FA verified",
        })
      } else {
        res.status(401).send({ error_message: "wrong 2FA" })
      }
    })
    .catch((err: Error) => {
      res.status(400).send({ error_message: err.message })
    })
}

export const addUsernameController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    let { username, resource } = req.body
    username = username.toLowerCase()
    const tokenData = await ValidToken(bearerHeader)
    let isUserNameAvailable = await User.findOne({ username: username })
    if (isUserNameAvailable) {
      res.status(400).send({
        error_message: "username already exist",
      })
    } else {
      User.findOneAndUpdate(
        { email: tokenData.data.email },
        { username, resource }
      )
        .then(() => {
          res.status(200).send({ message: "success" })
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    let { email } = req.body
    email = email.toLowerCase()
    let isUserAvailable = await User.findOne({ email: email })
    let token = await createJwtToken(email, "")
    let forgotLink = process.env.FRONTEND_URL + "reset?token=" + token
    if (isUserAvailable) {
      let mailOptions = {
        from: "youremail@gmail.com",
        to: email,
        subject: "Email verification code",
        html: `<p>Forgot password link <a href=${forgotLink}>Click me<a></p>`,
      }
      transporter.sendMail(mailOptions, function (error: string, info: any) {
        if (error) {
          res.status(401).send({ error_message: error })
        } else {
          res.status(200).send({
            message: "Please check your email for password change",
          })
        }
      })
    } else {
      res.status(401).send({
        error_message: "Email is not available",
      })
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const { password } = req.body
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      let hashPassword = await bcrypt.hash(password, 10)
      User.findOneAndUpdate(
        { email: tokenData.data.email },
        { password: hashPassword }
      )
        .then(() => {
          res.status(200).send({ message: "success" })
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const forgetGoogleAuthController = async (
  req: Request,
  res: Response
) => {
  let otp = Math.floor(100000 + Math.random() * 900000)
  const bearerHeader: any = req.headers["authorization"]
  const tokenData = await ValidToken(bearerHeader)
  let isMailSend = await verifyEmailSend(otp, tokenData.data.email)
  if (isMailSend) {
    User.findOneAndUpdate({ email: tokenData.data.email }, { otp: otp })
      .then(() => {
        res.status(200).send({
          message: "login successfully",
          tokens: {
            access: bearerHeader,
          },
          isVerify: false,
        })
      })
      .catch((err: Error) => {
        res.status(404).send({
          error_message: err.message,
        })
      })
  } else {
    res.status(404).send({
      error_message: "Something wrong,please try again later",
    })
  }
}

export const enableGoogleAuthController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    if (tokenData) {
      User.findOne({ email: tokenData.data.email }).then(
        async (result: IUser) => {
          if (!result.is2FAEnable) {
            let secret: any = speakeasy.generateSecret({
              name: result.email,
            })
            qrcode.toDataURL(
              secret.otpauth_url,
              function (err: Error, data: string) {
                res.status(200).send({
                  data: data,
                })
              }
            )
            await User.findOneAndUpdate(
              { email: result.email },
              { is2FAEnable: true, secret: secret.ascii }
            )
          } else {
            res.status(405).send({
              error_message: "2FA is already enable",
            })
          }
        }
      )
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const phoneOTPSMSSendController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { phoneCode, phoneNumber } = req.body
    if (tokenData) {
      const headers: any = {
        Authorization: process.env.CHECKMOBI_API_KEY,
        "Content-Type": "application/json",
      }
      const data = JSON.stringify({
        number: phoneCode + phoneNumber,
        type: "sms",
        platform: "ios",
      })
      await axios
        .post("https://api.checkmobi.com/v1/validation/request", data, {
          headers: headers,
        })
        .then(async (result: any) => {
          await User.findOneAndUpdate(
            { email: tokenData.data.email },
            { checkmobiId: result.data.id }
          )
          res.status(200).send({
            message: "success",
            data: result.data,
          })
        })
        .catch((error: Error) => console.log("error", error))
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const metamaskRegisterController = async (
  req: Request,
  res: Response
) => {
  try {
    let { metamaskAddress } = req.body
    const bearerHeader: any = req.headers["authorization"]
    if (bearerHeader) {
      const tokenData = await ValidToken(bearerHeader)
      if (tokenData) {
        User.findOne({ email: tokenData.data.email })
          .then(async (result: any) => {
            if (result.metamaskAddress) {
              res.status(400).send({
                error_message: "metamask address already exists",
              })
            } else {
              if (metamaskAddress) {
                User.findOneAndUpdate(
                  { email: tokenData.data.email },
                  { metamaskAddress: metamaskAddress }
                )
                  .then((result: IUser) => {
                    res.status(200).send({
                      message: "metamask linked with account successfully",
                    })
                  })
                  .catch((err: Error) => {
                    res.status(404).send({
                      error_message: err.message,
                    })
                  })
              } else {
                res.status(400).send({
                  error_message: "plase provide valid metamask address",
                })
              }
            }
          })
          .catch((err: Error) => {
            res.status(404).send({
              error_message: err.message,
            })
          })
      } else {
        res.status(401).send({
          error_message: "please enter valid token",
        })
      }
    } else {
      User.findOne({ metamaskAddress: metamaskAddress }).then(
        (result: IUser) => {
          if (result) {
            res.status(400).send({
              error_message: "metamask address already exists",
            })
          } else {
            User.create({ metamaskAddress })
              .then((result: IUser) => {
                res.status(201).send({
                  success: true,
                  message: "metamask user cretaed successfully",
                  data: result,
                })
              })
              .catch((err: Error) => {
                res.status(404).send({
                  error_message: err.message,
                })
              })
          }
        }
      )
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const reset_Password_OtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { email, phoneNumber, phoneCode } = req.body
    let otp = Math.floor(100000 + Math.random() * 900000)
    if (tokenData) {
      User.findOne({ email: email, phoneNumber: phoneNumber })
        .then(async (result) => {
          if (result) {
            let isMailSend = await verifyEmailSend(otp, result.email)
            if (isMailSend) {
              await User.findOneAndUpdate(
                { email: result.email },
                { emailOtp: otp }
              )
            }
            await phoneOtpSend(phoneCode, result.phoneNumber, email)
            res.status(200).send({})
          } else {
            res.status(404).send({
              error_message: "please provide valid email && phoneNumber",
            })
          }
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}
export const reset_PasswordController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { emailOtp, phoneOtp, password, confirmPassword } = req.body
    if (tokenData) {
      User.findOne({ _id: tokenData.data.id, emailOtp: emailOtp }).then(
        async (result) => {
          if (result) {
            let isPhoneOTPVerified = await verifyMisssedCallPinController(
              tokenData.data.email,
              phoneOtp
            )
            if (isPhoneOTPVerified) {
              if (password === confirmPassword) {
                let hashPassword = await bcrypt.hash(password, 10)
                await User.findOneAndUpdate(
                  { email: tokenData.data.email },
                  { password: hashPassword }
                ).then(() => {
                  res.status(200).send({})
                })
              } else {
                res.status(404).send({
                  error_message: "password and confirmPassword is not same. ",
                })
              }
            } else {
              res.status(404).send({ error_message: "phoneOtp is not valid" })
            }
          } else {
            res.status(404).send({ error_message: "emailOtp is not valid" })
          }
        }
      )
    } else {
      res.status(401)
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

export const initiate_callController = async (req: Request, res: Response) => {
  try {
    const bearerHeader: any = req.headers["authorization"]
    const tokenData = await ValidToken(bearerHeader)
    let { phoneNumber, phoneCode } = req.body
    if (tokenData) {
      User.findOne({ phoneNumber: phoneNumber })
        .then(async (result) => {
          if (result) {
            let intiateCall = await phoneOtpSend(
              phoneCode,
              phoneNumber,
              result.email
            )
            if (intiateCall) {
              res.status(200).send({})
            }
          } else {
            res
              .status(404)
              .send({ error_message: "phoneNumber is not available" })
          }
        })
        .catch((err: Error) => {
          res.status(404).send({
            error_message: err.message,
          })
        })
    } else {
      res.status(401).send("unAuthorized")
    }
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}
//comman functions
const googleAuthentication = async (
  token: string,
  res: Response,
  referralCode: string
) => {
  try {
    let otp = Math.floor(100000 + Math.random() * 900000)
    googleClient
      .verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT,
      })
      .then((result: any) => {
        const { email } = result.getPayload()
        User.findOne({ email: email })
          .then(async (result: IUser) => {
            if (result) {
              let token = createJwtToken(result.email, result._id)
              res.status(200).send({
                message: "login successfully",
                tokens: {
                  access: token,
                },
              })
            } else {
              let secret = speakeasy.generateSecret({
                name: email,
              })

              await User.create({
                type: "google",
                email,
                secret: secret.ascii,
                isEmailVerified: false,
                otp: otp,
                referData: {
                  referById: referralCode?.length === 11 ? referralCode : "",
                  referralCode: nanoid(11),
                  offerExpire: moment().format(),
                  isUsed: false,
                },
              })
                .then(async (Data: IUser) => {
                  await User.findOne({ email: email }).then(
                    async (result: any) => {
                      if (result) {
                        if (result.isEmailVerified == false) {
                          let isMailSend = await verifyEmailSend(otp, email)
                        }
                      }
                    }
                  )
                  let token = createJwtToken(Data.email, Data._id)
                  res.status(201).send({
                    success: true,
                    message: "success",
                    tokens: {
                      access: token,
                    },
                  })
                })
                .catch((err: Error) => {
                  res.status(404).send({
                    error_message: err.message,
                  })
                })
            }
          })
          .catch((err: Error) => {
            res.status(404).send({
              error_message: err.message,
            })
          })
      })
      .catch(() => {
        res.status(401).send({
          error_message: "google token is expired",
        })
      })
  } catch (err: any) {
    res.status(400).send({ error_message: err.message })
  }
}

const verifyEmailSend = async (otp: Number, email: string) => {
  let mailOptions = {
    from: "youremail@gmail.com",
    to: email,
    subject: "Email verification code",
    html: `<h1>${otp}</h1><p>OTP for verification.please don't share with other</p>`,
  }
  transporter.sendMail(mailOptions, function (error: string, info: any) {
    if (error) {
      console.log(error)
    } else {
      console.log("Email sent: " + info.response)
    }
  })
  return true
}

//mailgun email
// const verifyEmailSend = async (otp: Number, email: string) => {
//   const data = {
//     from: ' <getthriftydeveloper@gmail.com>',
//     to:email,
//     subject: "Email verification code",
//     text: 'Testing some Mailgun awesomness!',
//     html: `<h1>${otp}</h1><p>OTP for verification.please don't share with other</p>`,
//   };

//   mg.messages().send(data, (error:any,body:any) => {
//     if (error) {
//       console.log(error);
//     }else{
//       console.log(body);
//     }
//   });
//   return true
// }

// checkmobi missedcall
const phoneOtpSend = async (
  phoneCode: string,
  phoneNumber: string,
  email: string
) => {
  try {
    const headers: any = {
      Authorization: process.env.CHECKMOBI_API_KEY,
      "Content-Type": "application/json",
    }
    const data = JSON.stringify({
      number: phoneCode + phoneNumber,
      type: "reverse_cli",
      platform: "ios",
    })
    await axios
      .post("https://api.checkmobi.com/v1/validation/request", data, {
        headers: headers,
      })
      .then(
        async (result: any) =>
          await User.findOneAndUpdate(
            { email: email },
            { checkmobiId: result.data.id }
          )
      )
      .catch((error: Error) => console.log("error", error))
  } catch (err: any) {
    console.log(err)
  }
  return true
}

//verify checkmobi misscall
const verifyMisssedCallPinController = async (email: String, pin: number) => {
  try {
    let id
    await User.findOne({ email: email }).then((result: IUser) => {
      id = result.checkmobiId
    })
    const headers: any = {
      Authorization: process.env.CHECKMOBI_API_KEY,
      "Content-Type": "application/json",
    }
    const data = JSON.stringify({
      id: id, //transaction id
      pin: pin,
    })
    await axios
      .post("https://api.checkmobi.com/v1/validation/verify", data, {
        headers: headers,
      })
      .then((result: any) => console.log("result", result.data))
    return true
  } catch (error: any) {
    console.log("error", error.message)
  }
}
const createJwtToken = (email: string, id: string) => {
  return jwt.sign({ data: { email: email, id: id } }, "this is secret key", {
    expiresIn: 60 * 60 * 60,
  })
}

const ValidateEmail = (input: any) => {
  let text = input.toString()
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  if (text.match(validRegex)) {
    return true
  } else {
    return false
  }
}
