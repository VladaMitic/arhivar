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
      maxLength: [20, 'Назив категорије не може бити дужи од 20 слова'],
      minLength: [4, 'Назив категорије не може бити краћи од 4 слова'],
      required: [true, 'Морате унети име категорије'],
    },
    shelfLife: {
      type: Number,
      trim: true,
      max: [100, 'Рок чувања не може бити већи од 100 година'],
      min: [1, 'Рок чувања не може бити мањи од 1 године'],
      required: [true, 'Морате унети рок чувања'],
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

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
