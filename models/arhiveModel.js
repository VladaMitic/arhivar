const mongoose = require('mongoose');
const Paper = require('./paperModel');

const yearNow = new Date(Date.now()).getFullYear();

const arhiveSchema = new mongoose.Schema(
  {
    baseNumber: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Архива мора имати основни број архивираних докумената'],
      trim: true,
    },
    subnumbers: {
      type: Array,
      required: [
        true,
        'Архива мора имати низ подбројева архивираних докуманата',
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdAtYear: {
      type: String,
    },
    papersFrom: {
      type: Date,
      required: [
        true,
        'Архива мора имати време ОД када су увођена архивирана документа у делеоводник',
      ],
      trim: true,
    },
    papersTo: {
      type: Date,
      required: [
        true,
        'Архива мора имати време ДО када су увођена архивирана документа у делеоводник',
      ],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Архива мора имати садржај'],
      trim: true,
    },
    numberOfPapers: {
      type: Number,
      required: [true, 'Архива мора имати број докумената која се архивирају'],
      trim: true,
    },
    recordNumber: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    recordDate: {
      type: Date,
    },
    shelfLifeTo: {
      type: mongoose.Schema.Types.Mixed,
      trim: true,
      validate: {
        validator: function (val) {
          return (val >= yearNow && val <= yearNow + 100) || val === 'трајно';
        },
        message: `Рок чувања може бити између ${yearNow} и ${
          yearNow + 100
        } године, или трајно`,
      },
    },
    remark: {
      type: String,
      maxLength: [100, 'Напомена не може бити дужа од 100 карактера'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Архива мора да припада кориснику'],
    },
    papers: [mongoose.Schema.ObjectId],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

arhiveSchema.pre('save', async function (next) {
  const year = this.createdAt.getFullYear();
  this.createdAtYear = year;
});

arhiveSchema.virtual('papersPop', {
  ref: 'Paper',
  foreignField: 'arhive',
  localField: '_id',
});

arhiveSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'baseNumber',
    select: '-__v',
  });
  next();
});

//passing array of paper ids from pre save into post save middleware and save created arhive id and arhive time into arhived papers, and mark papers as arhived
let papers = [];

arhiveSchema.pre('save', async function (next) {
  papers = await this.papers;
  this.papers = undefined;
  next();
});

arhiveSchema.post('save', async (doc) => {
  const arhiveId = await doc.id;
  const dateNow = Date.now();
  await Paper.updateMany(
    { _id: { $in: papers } },
    { arhived: 'arhived', arhive: arhiveId, arhivedAt: dateNow },
    {
      new: true,
      runValidators: true,
    }
  );
});

const Arhive = mongoose.model('Arhive', arhiveSchema);
module.exports = Arhive;
