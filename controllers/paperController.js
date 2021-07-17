const mongoose = require('mongoose');
const Paper = require('../models/paperModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasCurentYearPapers = (req, res, next) => {
  const yearNow = new Date(Date.now()).getFullYear();
  req.query.createdAt = { gte: new Date(`${yearNow}-01-01`) };
  req.query.sort = '-createdAt';
  next();
};

exports.aliasNotArhived = (req, res, next) => {
  req.query.arhived = 'notarhived';
  req.query.sort = '-createdAt';
  req.query.fields =
    'baseNumber,subnumber,shortText,recipientSender,paperType,createdAt,-processor';
  next();
};

//get number of papers in papers collections that are in certain category-baseNumber
exports.getPapersNumForCategory = catchAsync(async (req, res, next) => {
  const paperNum = await Paper.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
        baseNumber: mongoose.Types.ObjectId(req.params.categoryId),
      },
    },
    {
      $group: {
        _id: '$baseNumber',
        numPapers: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    data: {
      paperNum,
    },
  });
});

//get data of all original sender and recipients of current user
exports.getRecipientsSenders = catchAsync(async (req, res, next) => {
  const recipientsSenders = await Paper.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
      },
    },
    {
      $group: {
        _id: '$recipientSender',
        recSendNum: { $first: '$RSId' },
      },
    },
    {
      $addFields: { recSendName: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    data: {
      recipientsSenders,
    },
  });
});

//change arhived field of selected documents before creating arhive template
exports.setPreparingOnSelectedPapers = catchAsync(async (req, res, next) => {
  if (!req.body.papersArhive)
    return next(
      new AppError('Не постоје подаци о документима који се архивирају.', 400)
    );
  if (!Array.isArray(req.body.papersArhive))
    return next(
      new AppError('Подаци нису у одговарајућем формату (низу).', 400)
    );
  await Paper.updateMany(
    { _id: { $in: req.body.papersArhive } },
    { arhived: 'preparing' },
    {
      new: true,
      runValidators: true,
    }
  );
  next();
});

exports.createArhiveTemplate = catchAsync(async (req, res, next) => {
  const arhiveTemplate = await Paper.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
        arhived: 'preparing',
      },
    },
    {
      $group: {
        _id: '$baseNumber',
        numberOfPapers: { $sum: 1 },
        papersFrom: { $min: '$createdAt' },
        papersTo: { $max: '$createdAt' },
        papers: { $push: '$_id' },
        subnumbers: { $push: '$subnumber' },
      },
    },
    {
      $addFields: { baseNumber: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  res.status(200).json({
    status: 'sucess',
    data: {
      arhiveTemplate,
    },
  });
});

exports.test = catchAsync(async (req, res, next) => {
  if (!req.body.papersArhive)
    return next(
      new AppError('Не постоје подаци о документима који се архивирају.', 400)
    );
  if (!Array.isArray(req.body.papersArhive))
    return next(
      new AppError('Подаци нису у одговарајућем формату (низу).', 400)
    );
  const updated = await Paper.updateMany(
    { _id: { $in: req.body.papersArhive } },
    { arhived: 'notarhived' },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'sucess',
    data: {
      updated,
    },
  });
});

exports.getAllPaper = factory.getAll(Paper);
exports.getPaper = factory.getOne(Paper);
exports.createPaper = factory.createOne(Paper);
exports.updatePaper = factory.updateOne(Paper);
exports.deletePaper = factory.deleteOne(Paper);
