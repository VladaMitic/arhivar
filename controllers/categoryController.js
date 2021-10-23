const Category = require('../models/categoryModel');
const factory = require('./handlerFactory');

exports.aliasActiveCategory = (req, res, next) => {
  req.query.active = true;
  next();
};

exports.aliasSortByBaseNumber = (req, res, next) => {
  req.query.sort = 'baseNumber';
  next();
};

exports.getAllCategory = factory.getAll(Category);
exports.getCategory = factory.getOne(Category);
exports.createCategory = factory.createOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
