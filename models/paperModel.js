const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema(
  {
    baseNumber: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Документ мора да има основни број'],
    },
    subnumber: {
      type: String,
      required: [true, 'Документ мора да има подброј'],
    },
    shortText: {
      type: String,
      required: [true, 'Документ мора садржати кртак текст'],
      maxLength: [
        250,
        'Кратак текст документа не може бити дужи од 250 карактера',
      ],
      minLength: [5, 'Кратак текст документа не може бити краћи од 5 слова'],
    },
    recipientSender: {
      type: String,
      trim: true,
      maxLength: [20, 'Име примаоца/пошиљаоца не може бити дуже од 20 слова'],
      minLength: [2, 'Име примаоца/пошиљаоца не може бити краће од 2 слова'],
      required: [true, 'Морате унети име примаоца/пошиљаоца'],
    },
    RSId: {
      type: String,
      trim: true,
      required: [
        true,
        'Морате унети матични број/јединствени матични број примаоца/пошиљаоца',
      ],
    },
    senderPaperNumber: {
      type: String,
    },
    senderDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paperType: {
      type: String,
      trim: true,
      enum: ['outgoing', 'incoming'],
    },
    processor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Processor',
      required: [true, 'Обрађивач мора да припада фирми'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Обрађивач мора да припада фирми'],
    },
    remark: {
      type: String,
      maxLength: [100, 'Напомена не може бити дужа од 100 карактера'],
      trim: true,
    },
    arhive: {
      type: mongoose.Schema.ObjectId,
      ref: 'Arhive',
    },
    arhived: {
      type: String,
      trim: true,
      enum: ['preparing', 'arhived', 'notarhived'],
      default: 'notarhived',
    },
    arhivedAt: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

paperSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'processor baseNumber',
    select: '-__v -user',
  });
  next();
});

const Paper = mongoose.model('Paper', paperSchema);
module.exports = Paper;
