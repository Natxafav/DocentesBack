var jwt = require("jsonwebtoken");

const autorizacion = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("fallo de autenticación 1");
    }
    decodedToken = jwt.verify(token, "clave_secreta");
    req.userData = {
      userId: decodedToken.userId,
    };
    next();
  } catch (error) {
    const err = new Error("Fallo de autenticación 2.");
    err.code = 401;
    return next(error);
  }
};
module.exports = autorizacion;
