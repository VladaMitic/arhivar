const express = require('express');
const processorController = require('../controllers/processorController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user', 'admin'));

router
  .route('/')
  .get(authController.setUserIdToQuery, processorController.getAllProcessor)
  .post(authController.setUserIdToBody, processorController.createProcessor);

router
  .route('/:id')
  .get(processorController.getProcessor)
  .delete(processorController.deleteProcessor)
  .patch(processorController.updateProcessor);

module.exports = router;
