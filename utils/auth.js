const jwt = require("jsonwebtoken");
const authClient = require("../constants/authClient");
const secretKey = process.env.SECRET_KEY;

const isExpiring = (exp) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeToExpire = exp - currentTime;
  return timeToExpire < 7200; // 2 hours before it expires
};

const refreshTokens = async (refreshToken) => {
  try {
    const newTokens = await authClient.refreshToken(refreshToken);
    return newTokens.tokens;
  } catch (err) {
    console.error("Error refreshing token:", err);
    throw err;
  }
};

const isAuthenticated = async (req, res, next) => {
  const jwtToken = req.cookies.jwtToken;
  const refreshToken = req.cookies.refreshToken;

  if (!jwtToken) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(jwtToken, secretKey);

    if (isExpiring(decoded.exp)) {
      const decodedRefreshToken = jwt.verify(refreshToken, secretKey);

      if (decodedRefreshToken) {
        const newTokens = await refreshTokens(decodedRefreshToken.refreshToken);
        const newJwtToken = jwt.sign(newTokens, secretKey, { expiresIn: "1d" });
        const newDecoded = jwt.verify(newJwtToken, secretKey);

        authClient.setCredentials(newDecoded);
        res.cookie("jwtToken", newJwtToken, { httpOnly: true, secure: false });
      } else {
        return res.status(401).send("Unauthorized");
      }
    } else {
      authClient.setCredentials(decoded);
    }

    next();
  } catch (error) {
    console.error("Error authenticating:", error);
    return res.status(401).send("Unauthorized");
  }
};

module.exports = { isAuthenticated };