const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    baseNumber: {
      type: Number,
      trim: true,
      max: [1000, 'Основни број не може бити већи од 1000'],
      min: [1, 'Основни број не може бити мањи од 1'],
      required: [true, 'Морате унети основни број'],
    },
    name: {
      type: String,
      trim: true,
      maxLength: [100, 'Назив категорије не може бити дужи од 100 слова'],
      minLength: [4, 'Назив категорије не може бити краћи од 4 слова'],
      required: [true, 'Морате унети име категорије'],
    },
    shelfLife: {
      type: mongoose.Schema.Types.Mixed,
      trim: true,
      // max: [100, 'Рок чувања не може бити већи од 100 година'],
      // min: [1, 'Рок чувања не може бити мањи од 1 године'],
      required: [true, 'Морате унети рок чувања'],
      validate: {
        validator: function (val) {
          return (val >= 1 && val <= 100) || val === 'трајно';
        },
        message: 'Рок чувања може бити између 1 и 100 година, или трајно',
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Обрађивач мора да припада фирми'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ baseNumber: 1, name: 1, user: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
