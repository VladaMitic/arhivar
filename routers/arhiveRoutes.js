const express = require('express');
const arhiveController = require('../controllers/arhiveController');
const authController = require('../controllers/authController');
const setCurrentYear = require('../utils/setCurrentYear');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user', 'admin'));

router
  .route('/countAllArhives')
  .get(authController.setUserIdToQuery, arhiveController.countAllArhives);
router
  .route('/countCurrentYearArhives')
  .get(
    authController.setUserIdToQuery,
    setCurrentYear.setCurrentYear,
    arhiveController.countAllArhives
  );

router
  .route('/currentYearArhive')
  .get(
    authController.setUserIdToQuery,
    setCurrentYear.setCurrentYear,
    arhiveController.aliasSortByCreatedAt,
    arhiveController.getAllArhive
  );

router
  .route('/notDestroyedArhive')
  .get(
    authController.setUserIdToQuery,
    arhiveController.aliasNotDestroyedPapers,
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
