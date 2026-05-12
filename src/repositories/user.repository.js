const User = require('../models/User');

const create = (data) => User.create(data);

const findByEmail = (email, withPassword = false) => {
  const query = User.findOne({ email });
  if (withPassword) query.select('+password');
  return query.lean();
};

const findById = (id, withPassword = false) => {
  const query = User.findById(id);
  if (withPassword) query.select('+password');
  return query.lean();
};

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true }).lean();

module.exports = { create, findByEmail, findById, updateById };
