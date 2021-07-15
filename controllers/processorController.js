const Processor = require('../models/processorModel');
const factory = require('./handlerFactory');

exports.getAllProcessor = factory.getAll(Processor);
exports.getProcessor = factory.getOne(Processor);
exports.createProcessor = factory.createOne(Processor);
exports.updateProcessor = factory.updateOne(Processor);
exports.deleteProcessor = factory.deleteOne(Processor);
