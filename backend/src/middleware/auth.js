const jwt = require('jsonwebtoken');

const auth = (role = null) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;

      if (role && req.user.role !== role) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Token is not valid' });
    }
  };
};

module.exports = auth;
