const mongoose = require('mongoose');

const processorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: [30, 'Име не може бити дуже од 30 слова'],
      minLength: [2, 'Име не може бити краће од 2 слова'],
      required: [true, 'Морате унети име обрађивача'],
    },
    nationalId: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          return val && val.length === 13;
        },
        message: 'ЈМБГ мора бити дужине 13 цифара',
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
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

const Processor = mongoose.model('Processor', processorSchema);
module.exports = Processor;
