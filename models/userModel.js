const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxLength: [20, 'Име не може бити дуже од 20 слова'],
      minLength: [2, 'Име не може бити краће од 2 слова'],
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: [20, 'Презиме не може бити дуже од 20 слова'],
      minLength: [2, 'Презиме не може бити краће од 2 слова'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Корисник мора имати eмаил адресу'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Eмаил адреса није валидна'],
    },
    nationalId: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          return val.length === 0 || val.length === 13;
        },
        message: 'ЈМБГ мора бити дужине 13 цифара',
      },
    },
    businessName: {
      type: String,
      trim: true,
      maxLength: [30, 'Име фирме не може бити дуже од 30 слова'],
    },
    identificationNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          return val.length === 0 || val.length === 8;
        },
        message: 'Матични број фирме мора бити дужине 8 цифара',
      },
    },
    taxId: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          return val.length === 0 || val.length === 9;
        },
        message: 'ПИБ мора бити дужине 9 цифара',
      },
    },
    place: {
      type: String,
      trim: true,
      maxLength: [20, 'Назив града не може бити дужи од 20 слова'],
      minLength: [2, 'Назив града не може бити краћи од 2 слова'],
    },
    street: {
      type: String,
      trim: true,
      minLength: [4, 'Назив улице не може бити краћи од 4 слова'],
    },
    buildingNumber: {
      type: Number,
      trim: true,
      min: 1,
      max: 10000,
    },
    letter: {
      type: String,
      trim: true,
      maxLength: [1, 'Слово у адреси не може бити дуже од једног слова'],
    },
    floor: {
      type: Number,
      trim: true,
      min: 0,
      max: 50,
    },
    apartmentNumber: {
      type: Number,
      trim: true,
      min: 0,
      max: 1000,
    },
    municipality: {
      type: String,
      trim: true,
      maxLength: [20, 'Назив општине не може бити дужи од 20 слова'],
      minLength: [2, 'Назив општине не може бити краћи од 2 слова'],
    },
    zipCode: {
      type: Number,
      trim: true,
      max: [40000, 'Поштански број не може бити већи од 50000'],
      min: [10000, 'Поштански број не може бити мањи од 10000'],
    },
    phone: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Контакт емаил адреса није валидна'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'pending'],
      default: 'pending',
    },
    subscriptionTime: {
      type: Number,
    },
    subscriptionDate: {
      type: Date,
    },
    subscriptionLeft: {
      type: Date,
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Морате унети лозину'],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      trim: true,
      required: [true, 'Морате унети потврду лозинке'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Унета лозинка и потврда лоинке се не подударају',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExp: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('categories', {
  ref: 'Category',
  foreignField: 'user',
  localField: '_id',
});

userSchema.virtual('processors', {
  ref: 'Processor',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const formatedPasswordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < formatedPasswordChangedAt;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExp = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
