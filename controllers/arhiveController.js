const Arhive = require('../models/arhiveModel');
const factory = require('./handlerFactory');

exports.aliasSortByCreatedAt = (req, res, next) => {
  req.query.sort = 'createdAt';
  next();
};

exports.aliasNotDestroyedPapers = (req, res, next) => {
  req.query.recordNumber = 'N/A';
  req.query.sort = 'shelfLifeTo';
  req.query.fields =
    'baseNumber,subnumbers,numberOfPapers,content,shelfLifeTo,createdAt,remark';
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
