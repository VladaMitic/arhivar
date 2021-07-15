const express = require('express');
const arhiveController = require('../controllers/arhiveController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user', 'admin'));

router
  .route('/currentYearArhive')
  .get(
    arhiveController.aliasCurentYearArhive,
    authController.setUserIdToQuery,
    arhiveController.getAllArhive
  );

router
  .route('/')
  .get(authController.setUserIdToQuery, arhiveController.getAllArhive)
  .post(authController.setUserIdToBody, arhiveController.createArhive);

router
  .route('/:id')
  .get(arhiveController.getArhive)
  .delete(arhiveController.deleteArhive)
  .patch(arhiveController.updateArhive);

module.exports = router;
