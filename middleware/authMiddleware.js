const jwt = require("jsonwebtoken");

const validateRequest = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];  
    console.log(token,"lkkklklklkl");

    if (!token) {
      return res.status(401).json({ message: "token is not found" });
    }          
   
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded.id);

    if (!decoded) {
      return res.status(401).json({ message: "User is not found" });
    }
    req.user = decoded.id; 

    next();
  } catch (err) {
    return res.status(401).json({ message: "token is not valid" });
  }
};

module.exports = validateRequest;
