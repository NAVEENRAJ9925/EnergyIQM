const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Accepts JWT (Bearer) or device API key (Bearer or X-Device-Api-Key). Sets req.user. */
module.exports = async (req, res, next) => {
  const bearer = req.header('Authorization')?.replace('Bearer ', '');
  const deviceKey = req.header('X-Device-Api-Key') || bearer;
  if (!bearer && !deviceKey) return res.status(401).json({ error: 'Access denied' });
  const token = deviceKey || bearer;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      req.user = { userId: decoded.userId };
      return next();
    }
  } catch {
    // Not a JWT; try device API key
  }

  const user = await User.findOne({ deviceApiKey: token }).lean();
  if (!user) return res.status(401).json({ error: 'Invalid device key' });
  req.user = { userId: user._id.toString() };
  next();
};
