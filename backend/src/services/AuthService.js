const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async register(username, password, role = 'USER') {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      },
      token
    };
  }

  async login(username, password) {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      },
      token
    };
  }

  generateToken(user) {
    const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
    return jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new AuthService();
