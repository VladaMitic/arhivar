const mongoose = require('mongoose');
const Paper = require('../models/paperModel');
const Category = require('../models/categoryModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//seting arhived field, those that are set on preparing by previous actions, to notarhive (eg. reset arhive process when it is braked)
exports.setPreparingOnNotarhived = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);
  const papers = await Paper.find({ arhived: 'preparing', ...queryObj });
  if (!papers) {
    return next();
  }
  papers.forEach(async (paper) => {
    await Paper.findByIdAndUpdate(
      paper._id,
      { arhived: 'notarhived' },
      {
        new: true,
        runValidators: true,
      }
    );
  });
  next();
});

//alias for geting all not arhived papers (notarhived and preparing)
exports.aliasNotArhived = (req, res, next) => {
  req.query.arhived = ['notarhived', 'preparing'];
  req.query.sort = '-createdAt';
  req.query.fields =
    'baseNumber,subnumber,shortText,recipientSender,paperType,createdAt,-processor';
  next();
};

//get number of papers in papers collections that are in certain category-baseNumber
exports.aliasGetPapersNumForCategory = (req, res, next) => {
  req.query.baseNumber = req.params.categoryId;
  req.query.sort = '-createdAt';
  req.query.fields = 'subnumber,-processor,-baseNumber';
  req.query.limit = 1;
  next();
};

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
  const arhive = await Paper.aggregate([
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
      $addFields: {
        baseNumber: '$_id',
        shelfLifeTo: '',
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  const arhiveTemplate = await Category.populate(arhive, {
    path: 'baseNumber',
  });
  arhiveTemplate.forEach((template) => {
    const year = new Date(Date.now()).getFullYear();
    template.shelfLifeTo =
      template.baseNumber.shelfLife === 'трајно'
        ? 'трајно'
        : year + template.baseNumber.shelfLife * 1;
  });
  res.status(200).json({
    status: 'sucess',
    data: {
      arhiveTemplate,
    },
  });
});

exports.countAllPapers = factory.countDocuments(Paper);
exports.getAllPaper = factory.getAll(Paper);
exports.getPaper = factory.getOne(Paper);
exports.createPaper = factory.createOne(Paper);
exports.updatePaper = factory.updateOne(Paper);
exports.deletePaper = factory.deleteOne(Paper);
