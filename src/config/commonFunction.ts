let jwt = require("jsonwebtoken")

export const ValidToken = async (bearerHeader: string) => {
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ")
    const token = bearer[1]
    let data = await jwt.verify(token, "this is secret key")
    return data
  }
}
