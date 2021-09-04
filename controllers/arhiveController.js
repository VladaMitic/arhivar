const Arhive = require('../models/arhiveModel');
const factory = require('./handlerFactory');

exports.aliasCurentYearArhive = (req, res, next) => {
  const yearNow = new Date(Date.now()).getFullYear();
  req.query.createdAt = { gte: new Date(`${yearNow}-01-01`) };
  req.query.sort = 'createdAt';
  next();
};

exports.countAllArhives = factory.countDocuments(Arhive);
exports.getAllArhive = factory.getAll(Arhive);
exports.getArhive = factory.getOne(Arhive, {
  path: 'papersPop',
});
exports.createArhive = factory.createOne(Arhive);
exports.updateArhive = factory.updateOne(Arhive);
exports.deleteArhive = factory.deleteOne(Arhive);
