const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const config = require('../config');
const logger = require('./logger');
const { ROLES } = require('../constants');

const ensureAdminExists = async () => {
  const existing = await User.findOne({ role: ROLES.ADMIN }).lean();
  if (existing) return;

  const password = await bcrypt.hash(config.admin.password, config.bcryptRounds);

  await User.create({
    name:        config.admin.name,
    email:       config.admin.email,
    phone:       config.admin.phone,
    password,
    role:        ROLES.ADMIN,
    is_verified: true,
    is_active:   true,
  });

  logger.info(`[BOOTSTRAP] Admin account created → ${config.admin.email}`);
};

module.exports = { ensureAdminExists };
