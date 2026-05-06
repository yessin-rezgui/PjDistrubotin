const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res) {
    try {
      const { username, password, role } = req.body;
      const data = await AuthService.register(username, password, role);
      res.status(201).json({ success: true, ...data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login(username, password);
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async me(req, res) {
    res.json({ success: true, user: req.user });
  }
}

module.exports = new AuthController();
