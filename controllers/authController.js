const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).send({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  await new Email(newUser).sendWelcome();
  createAndSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Молимо Вас унесите епошту и лозинку', 400));
  }

  const user = await User.findOne({ email: email })
    .select('+password')
    .select('+active');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Неисправна епошта и лозинка', 401));
  }
  if (!user.active) {
    return next(new AppError('Кориснички налог је обрисан'), 401);
  }

  createAndSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Нисте пријављени! Молимо Вас пријавите се', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select('+active');
  if (!currentUser.active) {
    return next(new AppError('Кориснички налог је обрисан'), 401);
  }
  if (!currentUser) {
    return next(
      new AppError('Корисик чији је ово токен више не постоји.', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Лозинка је промењена скоро! Молимо Вас пријавите се поново.',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.setUserIdToBody = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.setUserIdToQuery = (req, res, next) => {
  if (req.params.userId) req.query.user = req.params.userId;
  if (!req.query.user) req.query.user = req.user.id;
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Немате дозволу за ову акцију! Сачекајте одобрење од администратора. Уколико не добијете одобрење позовите на број 064/6386892 или 064/1063236',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'Не постоји корисник са овом епоштом. Молимо Вас пробајте поново.',
        404
      )
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `http://localhost:3000/change-password/${resetToken}`;
    //`${req.protocol}://arhivar.netlify.app/change-password/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExp = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'Дошло је до грешке у току слања епоруке! Молимо Вас покушајте поново.',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message:
      'Токен је послат на Вашу епошту! Уколико не видите поруку у вашем сандучету, молимо Вас проверите фолдер Spam (Непожељно)',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExp: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Токен је неважећи или је истекао', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExp = undefined;
  await user.save();

  createAndSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Неисправна лозинка.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, req, res);
});
