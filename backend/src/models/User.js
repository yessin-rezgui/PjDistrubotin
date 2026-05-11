const mongoose = require('mongoose');

const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
module.exports.USER_ROLES = USER_ROLES;
