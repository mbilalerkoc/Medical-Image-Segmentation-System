const { Op } = require("sequelize");
const User = require("../models/User");

const findByEmail = async (email, transaction = null) => {
  return User.findOne({
    where: {
      email,
    },
    transaction,
  });
};

const findByEmailExceptUserId = async (email, userId, transaction = null) => {
  return User.findOne({
    where: {
      email,
      id: {
        [Op.ne]: userId,
      },
    },
    transaction,
  });
};

const findByTcKimlik = async (tcKimlik, transaction = null) => {
  return User.findOne({
    where: {
      tc_kimlik: tcKimlik,
    },
    transaction,
  });
};

const findById = async (userId, attributes = null, transaction = null) => {
  const options = {
    transaction,
  };

  if (attributes) {
    options.attributes = attributes;
  }

  return User.findByPk(userId, options);
};

const create = async (data, transaction = null) => {
  return User.create(data, {
    transaction,
  });
};

const save = async (user, transaction = null) => {
  return user.save({
    transaction,
  });
};

module.exports = {
  findByEmail,
  findByEmailExceptUserId,
  findByTcKimlik,
  findById,
  create,
  save,
};
