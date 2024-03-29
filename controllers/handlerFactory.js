const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(
        new AppError('Није пронађен документ са траженим ID-ом', 404)
      );
    }
    doc.remove();
    res.status(204).json({
      status: 'sucess',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new AppError('Није пронађен документ са траженим ID-ом', 404)
      );
    }
    res.status(200).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    if (req.user.role === 'admin') query = query.select('+active');
    const doc = await query;
    if (!doc) {
      return next(
        new AppError('Није пронађен документ са траженим ID-ом', 404)
      );
    }
    res.status(200).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, selectOptions) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    if (selectOptions) features.query = features.query.select(selectOptions);
    const doc = await features.query;
    res.status(200).json({
      status: 'sucess',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.countDocuments = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query).filter();
    const numDocs = await features.query.countDocuments();
    res.status(200).json({
      status: 'sucess',
      data: {
        data: numDocs,
      },
    });
  });
