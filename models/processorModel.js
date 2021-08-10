const mongoose = require('mongoose');

const processorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxLength: [20, 'Име не може бити дуже од 20 слова'],
      minLength: [2, 'Име не може бити краће од 2 слова'],
      required: [true, 'Морате унети име обрађивача'],
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: [20, 'Презиме не може бити дуже од 20 слова'],
      minLength: [2, 'Презиме не може бити краће од 2 слова'],
      required: [true, 'Морате унети презиме обрађивача'],
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
    phoneNumber: {
      type: String,
      trim: true,
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

const Processor = mongoose.model('Processor', processorSchema);
module.exports = Processor;
