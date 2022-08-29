const jwt = require("jsonwebtoken");

const autorizacion = (req, res, next) => {
  try {
    const token = req.headers.autorization.split("")[1];
    if (!token) {
      throw new Error("Fallo de autenticación 1");
    }
    decodedTOKEN = jwt.verify(token, "clave_supermegasecreta");
    req.userData = {
      userId: decodedTOKEN.userId,
    };
    next();
  } catch (error) {
    const err = new Error("Fallo de autenticación 2.");
    err.code = 401;
    return next(error);
  }
};
module.exports = autorizacion;
