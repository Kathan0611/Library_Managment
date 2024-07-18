const jwt = require("jsonwebtoken");

const validateRequest = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];  
    console.log(token,"lkkklklklkl");

    if (!token) {
      return res.status(401).json({ message: "token is not found" });
    }          
   
    const decoded = await jwt.verify(token, process.env.access_token);
    console.log(decoded.id,"io");

    if (!decoded.id) {
      return res.status(401).json({ message: "User is not found" });
    }
    req.user = decoded.id; 

    next();
  } catch (err) {
    return res.status(401).json({ message: "token is not valid" });
  }
};

module.exports = validateRequest;
