const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Ова рута није за промену лозинке. Молим Вас користите руту /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'email',
    'nationalId',
    'identificationNumber',
    'taxId',
    'place',
    'street',
    'buildingNumber',
    'letter',
    'floor',
    'apartmentNumber',
    'municipality',
    'zipCode',
    'phone'
  );
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Ова рута није дефинисана. Коистите /signup руту уместо овога!',
  });
};

exports.subscribeUser = catchAsync(async (req, res, next) => {
  if (!req.body.subscribe) next();
  const user = await User.findById(req.params.id);
  const subscriptionDate = Date.now();
  const newSubscriptionTime = parseInt(
    (user.subscriptionLeft - subscriptionDate) / (1000 * 60 * 60 * 24),
    10
  );
  const subscriptionTime = user.subscriptionTime
    ? newSubscriptionTime + 365
    : 365;
  req.body.subscriptionTime = subscriptionTime;
  req.body.subscriptionDate = subscriptionDate;
  req.body.subscriptionLeft = new Date(
    Date.now() + subscriptionTime * 24 * 60 * 60 * 1000
  );
  next();
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, {
  path: 'processors categories',
});
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
